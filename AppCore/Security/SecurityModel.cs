using API.Controllers;
using APPCORE.Services;


namespace APPCORE.Security
{
	public class Security_Roles : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Role { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
		[OneToMany(TableName = "Security_Permissions_Roles", KeyColumn = "Id_Role", ForeignKeyColumn = "Id_Role")]
		public List<Security_Permissions_Roles>? Security_Permissions_Roles { get; set; }
		public object SaveRole()
		{
			if (this.Id_Role == null)
			{
				this.Save();
			}
			else
			{
				this.Update("Id_Role");
			}
			if (this.Security_Permissions_Roles != null)
			{
				Security_Permissions_Roles IdI = new Security_Permissions_Roles();
				IdI.Id_Role = this.Id_Role;
				IdI.Delete();
				foreach (Security_Permissions_Roles obj in this.Security_Permissions_Roles)
				{
					obj.Id_Role = this.Id_Role;
					obj.Save();
				}
			}
			return this;
		}
		public object GetRolData()
		{
			this.Security_Permissions_Roles = new Security_Permissions_Roles()
			{
				Id_Role = this.Id_Role
			}.Get<Security_Permissions_Roles>();
			return this.Security_Permissions_Roles;

		}
		public List<Security_Roles>? GetRoles()
		{
			var roles = this.Get<Security_Roles>();
			foreach (Security_Roles role in roles)
			{
				role.GetRolData();
			}
			return roles;
		}
	}
	public class Security_Users : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_User { get; set; }
		public string? Nombres { get; set; }
		public string? Estado { get; set; }
		public string? Descripcion { get; set; }
		public string? Password { get; set; }
		public string? Mail { get; set; }
		public string? Token { get; set; }
		public DateTime? Token_Date { get; set; }
		public DateTime? Token_Expiration_Date { get; set; }
		public DateTime? Password_Expiration_Date { get; set; }

		[OneToMany(TableName = "Security_Users_Roles", KeyColumn = "Id_User", ForeignKeyColumn = "Id_User")]
		public List<Security_Users_Roles>? Security_Users_Roles { get; set; }

		[OneToMany(TableName = "Tbl_Profile", KeyColumn = "Id_User", ForeignKeyColumn = "IdUser")]
		public List<Tbl_Profile>? Tbl_Profiles { get; set; }

		public Tbl_Profile? Get_Profile()
		{
			return new Tbl_Profile { IdUser = Id_User }.Find<Tbl_Profile>();
		}
		public Security_Users? GetUserData()
		{
			Security_Users? user = this.Find<Security_Users>();
			if (user != null && user.Estado == "ACTIVO")
			{
				user.Security_Users_Roles = new Security_Users_Roles()
				{
					Id_User = user.Id_User
				}.Get<Security_Users_Roles>();
				foreach (Security_Users_Roles role in user.Security_Users_Roles ?? new List<Security_Users_Roles>())
				{
					role.Security_Role?.GetRolData();
				}
				return user;
			}
			if (user?.Estado == "INACTIVO")
			{
				throw new Exception("usuario inactivo");
			}
			return null;
		}
		public object SaveUser(string identity)
		{
			if (!AuthNetCore.HavePermission(Permissions.ADMINISTRAR_USUARIOS.ToString(), identity))
			{
				throw new Exception("no tiene permisos");
			}
			var response = Save_User(new Tbl_Profile()
			{
				Nombres = this.Nombres,
				Estado = this.Estado,
				Correo_institucional = this.Mail,
				Foto = "\\Media\\profiles\\avatar.png"
			}) as ResponseService;
			
			return response;
		}

		

		public object Save_User(Tbl_Profile? tbl_Profile)
		{
			try
			{
				//this.BeginGlobalTransaction();
				return DoSaveUser(tbl_Profile);				
			}
			catch (Exception ex)
			{
				return new ResponseService(400, ex.Message);
			}
		}

		public object DoSaveUser(Tbl_Profile? tbl_Profile)
		{
			Security_Users? thisUser = null;
			if (Id_User != null)
			{
				thisUser = new Security_Users { Id_User = Id_User }.Find<Security_Users>();
			}

			if (this.Password != null)
			{
				this.Password = EncrypterServices.Encrypt(this.Password);
				if (thisUser != null && thisUser.Password_Expiration_Date != null)
				{
					this.Password_Expiration_Date = DateTime.Now.AddDays(30);
				}
			}
			if (this.Id_User == null)
			{
				if (new Security_Users() { Mail = this.Mail }.Exists())
				{
					throw new Exception("Correo en uso");
				}
				var user = Save();
				if (tbl_Profile != null)
				{
					tbl_Profile.IdUser = ((Security_Users?)user)?.Id_User;
					tbl_Profile.Save();
				}

			}
			else
			{				
				if (new Security_Users().Find<Security_Users>(
					FilterData.Distinc("Id_User", this.Id_User),
					FilterData.Equal("Mail", this.Mail)
				) != null)
				{
					throw new Exception("Este correo esta en uso por otro usuario");
				}
				if (this.Estado == null)
				{
					this.Estado = "ACTIVO";
				}
				this.Update("Id_User");
			}
			if (this.Security_Users_Roles != null)
			{
				Security_Users_Roles IdI = new Security_Users_Roles();
				IdI.Id_User = this.Id_User;
				IdI.Delete();
				foreach (Security_Users_Roles obj in this.Security_Users_Roles)
				{
					obj.Id_User = this.Id_User;
					obj.Save();
				}
			}
			return new ResponseService(200,"Datos guardados");
		}

		public object GetUsers()
		{
			var Security_Users_List = this.Where<Security_Users>(FilterData.Limit(30));
			foreach (Security_Users User in Security_Users_List)
			{
				User.Security_Users_Roles =
					new Security_Users_Roles().Where<Security_Users_Roles>(FilterData.In("Id_User", User.Id_User.ToString()));
			}
			return Security_Users_List;
		}
		internal bool IsAdmin()
		{
			return Security_Users_Roles?.Find(r => r.Security_Role?.Security_Permissions_Roles?.Find(p =>
			 p.Security_Permissions.Descripcion.Equals(Permissions.ADMIN_ACCESS.ToString())
			) != null) != null;
		}
		internal object RecoveryPassword(MailConfig? config)
		{
			Security_Users? user = this.Find<Security_Users>();
			if (user != null && user.Estado == "ACTIVO")
			{
				string password = Guid.NewGuid().ToString();
				user.Password = EncrypterServices.Encrypt(password);
				user.Update();
				_ = SMTPMailServices.SendMail("support@password.recovery",
				 [user.Mail],
				 "Recuperación de contraseña",
				 $"nueva contraseña: {password}", null, null, config);
				return user;
			}
			if (user?.Estado == "INACTIVO")
			{
				throw new Exception("usuario inactivo");
			}
			return null;
		}

		public object? changePassword(string? sessionKey)
		{
			var security_User = AuthNetCore.User(sessionKey).UserData;
			Password = EncrypterServices.Encrypt(Password);
			Id_User = security_User?.Id_User;
			return Update();
		}

		internal object RecoveryPassword(MailConfig? config, string? passwordE = null)
		{
			Security_Users? user = this.Find<Security_Users>();
			if (user != null && user.Estado == "ACTIVO")
			{
				string password = passwordE ?? Guid.NewGuid().ToString();
				user.Password = EncrypterServices.Encrypt(password);
				user.Update();
				_ = SMTPMailServices.SendMail("support@password.recovery",
				 [user.Mail],
				 "Recuperación de contraseña",
				 $"nueva contraseña: {password}", null, null, config);
				return user;
			}
			if (user?.Estado == "INACTIVO")
			{
				throw new Exception("usuario inactivo");
			}
			return null;
		}
	}

	public class Tbl_Profile : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Perfil { get; set; }
		public string? Nombres { get; set; }
		public string? Apellidos { get; set; }
		public DateTime? FechaNac { get; set; }
		public int? IdUser { get; set; }
		public string? Sexo { get; set; }
		public string? Foto { get; set; }
		public string? DNI { get; set; }
		public string? Correo_institucional { get; set; }
		public string? Estado { get; set; }

		public string GetNombreCompleto()
		{
			return $"{Nombres} {Apellidos}";
		}
	}
	public class Security_Permissions : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Permission { get; set; }
		public string? Descripcion { get; set; }
		public string? Detalles { get; set; }
		public string? Estado { get; set; }

		public static void PrepareDefaultPermissions()
		{
			var permissionsList = Enum.GetValues(typeof(Permissions));
			foreach (Permissions permisionDescription in permissionsList)
			{
				try
				{
					var PermissionsFind = new Security_Permissions { Descripcion = permisionDescription.ToString() }.Find<Security_Permissions>();
					if (PermissionsFind == null)
					{
						new Security_Permissions
						{
							Descripcion = permisionDescription.ToString(),
							Detalles = permisionDescription.ToString(),
							Estado = "ACTIVO"
						}.Save();
					}
				}
				catch (System.Exception)
				{
					throw;
				}
			}
		}

        public ResponseService UpdatePermision()
        {
            return new Security_Permissions{ Id_Permission= this.Id_Permission,  Detalles = this.Detalles }.Update();
        }
    }
	public class Security_Permissions_Roles : EntityClass
	{
		[PrimaryKey(Identity = false)]
		public int? Id_Role { get; set; }
		[PrimaryKey(Identity = false)]
		public int? Id_Permission { get; set; }
		public string? Estado { get; set; }
		[ManyToOne(TableName = "Security_Permissions", KeyColumn = "Id_Permission", ForeignKeyColumn = "Id_Permission")]
		public Security_Permissions? Security_Permissions { get; set; }
	}
	public class Security_Users_Roles : EntityClass
	{
		[PrimaryKey(Identity = false)]
		public int? Id_Role { get; set; }
		[PrimaryKey(Identity = false)]
		public int? Id_User { get; set; }
		public string? Estado { get; set; }
		[ManyToOne(TableName = "Security_Role", KeyColumn = "Id_Role", ForeignKeyColumn = "Id_Role")]
		public Security_Roles? Security_Role { get; set; }
	}
}

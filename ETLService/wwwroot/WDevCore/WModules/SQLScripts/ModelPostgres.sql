DO $$
DECLARE  r record; r2 record; typeC text;
begin	
	raise notice 
    FOR r IN
        SELECT * FROM information_schema.tables 
		WHERE table_schema = 'public'
    loop
	    RAISE NOTICE '---------------> %', r.table_name;
	     for r2 in  
	     	SELECT 
			   table_name, 
			   column_name, 
			   data_type 
			FROM 
			   information_schema.columns
			WHERE 
			   table_name = r.table_name
	     loop   
		    if found then
		     	case r2.data_type
		           WHEN   'integer' THEN typeC := 'int' ;
		           WHEN   'text' THEN typeC := 'String';
		           else typeC := 'Unspecified';
		       	END case;
		     else
	    	  typeC := 'Unspecified';
		     end if; 
	    	RAISE NOTICE '% %', typeC,  r2.column_name;
    	 end loop;	    
    END LOOP;
    RETURN;   
END$$;
import { css } from "../../WModules/WStyledRender.js";
export const WModalStyle = css`
  .ContainerFormWModal {
       display: grid;
       grid-template-rows: 50px calc(100% - 50px);
       margin: auto;
       margin-top: 20px;
       background-color: var(--primary-color);
       width: 60%;
       border-radius: 0.3cm;
       position: relative;
       box-shadow: 0 0px 3px 0px #000;
       padding: 0 0 20px 0;
  }

  .ContainerFormWModal h1,
  .ContainerFormWModal h3,
  .ContainerFormWModal h4,
  .ContainerFormWModal h5 {
       display: block;
       text-align: center;
       font: 400 13.3333px !important;
       margin: 10px 0px;
  }
  .ContainerFormWModal h4,
  .ContainerFormWModal h5 {
       text-align: left
  }

  .ModalContent {
       display: block;
       padding: 20px;
  }

  .ModalHeader {
       color: var(--font-secundary-color);
       font-weight: bold;
       font-size: 20px;
       display: flex;
       justify-content: center;
       align-items: center;
       padding: 30px;
       text-transform: uppercase;
       position: relative;
  }

  .ModalElement {
       background-color: #4da6ff;
       padding: 10px;
       border-radius: 5px;
  }

  .BtnClose {
       font-size: 18pt;
       position: absolute;
       color: #b9b2b3;
       cursor: pointer;
       width: 30px;
       border-radius: 10px;
       display: flex;
       justify-content: center;
       align-items: center;
       border: none;
       background-color: unset;
       top: 10px;
       right: 20px;
  }

  .HeaderIcon {
       height: 50px;
       width: 50px;
       position: relative;
       left: -10px;
       ;
  }

  .ObjectModalContainer {
       height: 100%;
       width: 90%;
       margin: 0px auto;
       margin-bottom: 20px;
       display: block;
       justify-content: center;
       padding: 5px;
       overflow-y: auto;
  }
  .ObjectModalElementContainer {
     overflow-y: auto;
  }

  @media (max-width: 1200px) {
       .ContainerFormWModal {
            width: 90% !important;
       }
  }

  @media (max-width: 800px) {
     .ModalContent {
          display: block;
          padding: 10px;
          overflow-y:auto;
     }
       .ContainerFormWModal {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            height: 100% !important;
            margin-top: 0px;
            width: 100% !important;
            max-height: calc(100vh - 0px);
            height: calc(100vh - 0px);
            border-radius: 0cm;
       }

       divForm {
            padding: 20px;
            display: grid;
            grid-gap: 1rem;
            grid-template-columns: calc(100% - 20px) !important;
            grid-template-rows: auto;
            justify-content: center;
       }

       .ObjectModalContainer {
            max-height: calc(100% - 80px);
       }
  }
`;
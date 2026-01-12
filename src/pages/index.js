import Card from "../components/Card.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithImage from "../components/PopupWithImage.js";
import PopupWithForm from "../components/PopupWithForm.js";
import { setOverlayAndEscClose } from "../components/utils.js";
import UserInfo from "../components/UserInfo.js";
import Api from "../components/Api.js";
import PopupWithConfirmation from "../components/PopupWithConfirmation.js";

// --- Instancia Api ---

const api = new Api({
  baseUrl: "https://around-api.es.tripleten-services.com/v1",
  headers: {
    authorization: "021e4328-0015-4879-bf18-295529cc966b",
    "Content-Type": "application/json",
  },
});

// --- Configuración de validación ---
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button-save",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
};

// --- Inicializar validadores ---
const forms = Array.from(document.querySelectorAll(".popup__form"));
forms.forEach((form) => {
  const validator = new FormValidator(validationConfig, form);
  validator.enableValidation();
});

// --- Elementos principales ---
const sectionGallery = document.querySelector(".gallery__list");
const templateSelector = "#template-card";

// --- Instancias ---
const userInfo = new UserInfo({
  nameSelector: ".profile__name",
  jobSelector: ".profile__role",
  avatarSelector: ".profile__avatar",
});

api
  .getAppInfo()
  .then(([userData, cards]) => {
    // --- Usuario ---
    userInfo.setUserInfo({
      name: userData.name,
      job: userData.about,
      avatar: userData.avatar,
    });

    // --- Tarjetas ---
    cards.forEach((item) => {
      const card = new Card(
        item,
        templateSelector,
        handleImageClick,
        userData._id,
        (cardElement, cardId) => deleteCardPopup.open(cardElement, cardId)
      );

      const cardElement = card.generateCard();
      sectionGallery.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// --- Popup editar perfil ---
const editProfilePopup = new PopupWithForm("#popup-edit", (formData) => {
  return api
    .updateUserInfo({ name: formData.name, about: formData.job })
    .then((userData) => {
      userInfo.setUserInfo({
        name: userData.name,
        job: userData.about,
        avatar: userData.avatar,
      });
      editProfilePopup.close();
    })
    .catch((err) => console.log(err));
});

editProfilePopup.setEventListeners();

const butEdit = document.querySelector(".profile__edit-btn");

butEdit.addEventListener("click", () => {
  const userData = userInfo.getUserInfo();
  editProfilePopup.setInputValues(userData);
  editProfilePopup.open();
});

// --- Popup Editar Avatar ---

const avatarPopup = new PopupWithForm("#popup-avatar", (formData) => {
  return api
    .updateAvatar({ avatar: formData.avatar })
    .then((userData) => {
      userInfo.setUserInfo({
        avatar: userData.avatar,
      });
      avatarPopup.close();
    })
    .catch((err) => {
      console.log(err);
    });
});

avatarPopup.setEventListeners();

// --- Popup Agregar Lugar ---

const addPlacePopup = new PopupWithForm("#popup-place", (formData) => {
  return api
    .addCard({
      name: formData.name,
      link: formData.link,
    })
    .then((cardData) => {
      const card = new Card(
        cardData,
        templateSelector,
        handleImageClick,
        userInfo.getUserInfo()._id,
        handleDeleteConfirm
      );

      const cardElement = card.generateCard();
      sectionGallery.prepend(cardElement);
      addPlacePopup.close();
    })
    .catch((err) => {
      console.log(err);
    });
});
addPlacePopup.setEventListeners();

const avatarEditButton = document.querySelector(".profile__avatar-edit");

avatarEditButton.addEventListener("click", () => {
  avatarPopup.open();
});

// --- Botones que abren popups ---
const butAdd = document.querySelector(".profile__add-btn");

butAdd.addEventListener("click", () => {
  addPlacePopup.open();
});

// --- Popup de Imagen ---
const imagePopup = new PopupWithImage(".popup_type_image");
imagePopup.setEventListeners();

// --- Popup Confirmación Eliminar Tarjeta ---
const deleteCardPopup = new PopupWithConfirmation(
  "#popup-delete",
  (cardElement, cardId) => {
    api
      .deleteCard(cardId)
      .then(() => {
        cardElement.remove();
        deleteCardPopup.close();
      })
      .catch((err) => console.log(err));
  }
);

deleteCardPopup.setEventListeners();

function handleImageClick(name, link) {
  imagePopup.open({ name, link });
}

// --- Activar cierre con overlay y tecla ESC ---
setOverlayAndEscClose();

export default class Card {
  constructor(
    data,
    templateSelector,
    handleImageClick,
    currentUserId,
    handleDeleteConfirm
  ) {
    this._name = data.name;
    this._link = data.link;
    this._id = data._id;
    this._ownerId = data.owner;
    this._isLiked = data.isLiked;
    this._templateSelector = templateSelector;
    this._handleImageClick = handleImageClick;
    this._currentUserId = currentUserId;
    this._handleDeleteConfirm = handleDeleteConfirm;
  }

  // Clona el template de la tarjeta
  _getTemplate() {
    const cardElement = document
      .querySelector(this._templateSelector)
      .content.querySelector(".gallery__item")
      .cloneNode(true);
    return cardElement;
  }

  // Maneja el evento de eliminar
  _handleDelete() {
    this._element.remove();
    this._element = null;
  }

  // Maneja el evento de like
  _handleLike() {
    if (!this._isLiked) {
      api
        .likeCard(this._id)
        .then((res) => {
          this._isLiked = true;
          this._likeButton.classList.add("gallery__like-btn_active");
        })
        .catch((err) => console.log(err));
    } else {
      api
        .unlikeCard(this._id)
        .then((res) => {
          this._isLiked = false;
          this._likeButton.classList.remove("gallery__like-btn_active");
        })
        .catch((err) => console.log(err));
    }
  }

  // Asigna los event listeners
  _setEventListeners() {
    this._deleteButton.addEventListener("click", () => {
      this._handleDeleteConfirm(this._element, this._id);
    });

    this._likeButton.addEventListener("click", () => {
      if (!this._isLiked) {
        this._likeButton.classList.add("gallery__like-btn_active");
        this._isLiked = true;
      } else {
        this._likeButton.classList.remove("gallery__like-btn_active");
        this._isLiked = false;
      }
    });

    this._imageElement.addEventListener("click", () =>
      this._handleImageClick(this._name, this._link)
    );
  }

  // Genera la tarjeta completa
  generateCard() {
    this._element = this._getTemplate();
    this._imageElement = this._element.querySelector(".gallery__image");
    this._titleElement = this._element.querySelector(".gallery__title");
    this._deleteButton = this._element.querySelector(".gallery__delete-btn");
    this._likeButton = this._element.querySelector(".gallery__like-btn");

    this._imageElement.src = this._link;
    this._imageElement.alt = this._name;
    this._titleElement.textContent = this._name;

    if (this._ownerId !== this._currentUserId) {
      this._deleteButton.style.display = "none";
    }

    if (this._isLiked) {
      this._likeButton.classList.add("gallery__like-btn_active");
    }

    this._setEventListeners();

    return this._element;
  }
}

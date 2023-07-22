// import React, { Children, Component } from 'react';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import css from './App.module.css';
import { Searchbar } from './searchbar/Searchbar';
import { ImageGallery } from './imagegallery/ImageGallery';
import { ImageGalleryItem } from './imagegalleryitem/ImageGalleryItem';
import { Button } from './button/Button';
import { Loader } from './loader/Loader';
import { Modal } from './modal/Modal';
import {
  headerDefaultGet,
  headerDefaultUrl,
  paramsDefaultUrl,
} from '../js/config/stdquery';
import Notiflix from 'notiflix';
import { apikeyPixabay } from '../js/config/apikey';
import { axiosData } from '../js/apireset/axios-data';

let searchPchrase = '';
let currentPage = 1;
let perPage = 12;
let totalHits = 0;
let largeImageURL = '';
let alt = '';

export const App = () => {
  const galleryRef = useRef();

  const [data, setData] = useState([]);
  const [isData, setIsData] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    if (isScroll) {
      const cardElement = galleryRef.current.firstElementChild;
      const { height: cardHeight } = cardElement.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 3,
        behavior: 'smooth',
      });
    }
  }, [isScroll, data]);

  const handleSubmit = async evt => {
    evt.preventDefault();
    searchPchrase = evt.target.form.inputsearch.value;
    currentPage = 1;
    setIsLoading(true);
    try {
      const response = await getDataFromServer();
      if (response.code !== 'ERR_NETWORK') {
        dataToDisplayPreparation(response);
      } else {
        Notiflix.Notify.failure(`${response.code}`);
        // this.setState({ isLoading: false });
        setIsLoading(false);
      }
    } catch (error) {
      Notiflix.Notify.failure(`${error}`);
    }
  };

  function dataToDisplayPreparation(response) {
    setIsScroll(false);
    if (window.scrollY > 0) {
      window.scrollBy({
        top: -window.scrollY,
        behavior: 'smooth',
      });
    }
    if (response.length !== 0) {
      Notiflix.Notify.success(`You have ${totalHits} hits`);
      Notiflix.Notify.success(`Now loading ${response.length}`);
      if (totalHits > perPage) {
        setIsPages(true);
      } else {
        setIsPages(false);
      }
      setIsData(true);
      setData([...response]);
    } else {
      setIsData(false);
      setData([]);
      setIsPages(false);
      Notiflix.Notify.failure(`You have ${totalHits} hits`);
    }
  }

  const handleLoadMore = async evt => {
    currentPage += 1;
    setIsLoading(true);
    try {
      const response = await getDataFromServer();
      if (response.code !== 'ERR_NETWORK') {
        dataToAddDisplayPreparation(response);
      } else {
        Notiflix.Notify.failure(`${response.code}`);
        setIsLoading(false);
      }
    } catch (error) {
      Notiflix.Notify.failure(`${error}`);
    }
  };

  function dataToAddDisplayPreparation(response) {
    Notiflix.Notify.success(`You have ${totalHits} hits`);
    Notiflix.Notify.success(`Now loading ${response.length} more`);
    let totalPages = 0;
    if (totalHits % perPage !== 0) {
      totalPages = Math.trunc(totalHits / perPage) + 1;
    } else if (totalHits % perPage === 0) {
      totalPages = totalHits / perPage;
    }
    if (totalPages === currentPage) {
      setIsPages(false);
    }
    setIsData(true);
    setData([...data, ...response]);
    setIsScroll(true);
  }

  const handleImageClick = evt => {
    if (evt.target.nodeName !== 'IMG') {
      return;
    }
    window.addEventListener('keyup', handleModalKeyDown);
    largeImageURL = evt.target.dataset.img;
    alt = evt.target.dataset.alt;
    setIsModal(true);
  };

  const handleModalClick = evt => {
    if (evt.target.nodeName === 'DIV') {
      largeImageURL = '';
      alt = '';
      setIsModal(false);
      window.removeEventListener('keyup', handleModalKeyDown);
    }
  };

  const handleModalKeyDown = evt => {
    largeImageURL = '';
    alt = '';
    evt = evt || window.event;
    let isEscape = false;
    if ('key' in evt) {
      isEscape = evt.key === 'Escape' || evt.key === 'Esc';
    } else {
      isEscape = evt.keyCode === 27;
    }
    if (isEscape) {
      setIsModal(false);
      window.removeEventListener('keyup', handleModalKeyDown);
    }
  };

  async function getDataFromServer() {
    const header = { ...headerDefaultGet, ...headerDefaultUrl };
    const parameters = {
      ...paramsDefaultUrl,
      key: apikeyPixabay,
      q: searchPchrase,
      page: currentPage,
    };
    try {
      const response = await axiosData(header, parameters);
      if (response.code !== 'ERR_NETWORK') {
        setIsLoading(false);
        totalHits = response.data.totalHits;
        let filteredResponse = [];
        if (response.data.hits.length !== 0) {
          for (let element of response.data.hits) {
            const { webformatURL, largeImageURL, tags, id } = element;
            filteredResponse.push({ webformatURL, largeImageURL, tags, id });
          }
        }
        return filteredResponse;
      } else {
        return response;
      }
    } catch (error) {
      setIsLoading(false);
      Notiflix.Notify.failure(`${error}`);
      return error;
    }
  }

  return (
    <div className={css.app}>
      <Searchbar onSubmit={handleSubmit} />
      <main>
        <ImageGallery action={handleImageClick} ref={galleryRef}>
          {isData &&
            data.map(element => (
              <ImageGalleryItem
                key={element.id}
                id={element.id}
                webformatURL={element.webformatURL}
                largeImageURL={element.largeImageURL}
                alt={element.tags}
              />
            ))}
        </ImageGallery>

        {isLoading && <Loader name="RotatingLines" />}
        {isModal && (
          <Modal
            largeImageURL={largeImageURL}
            alt={alt}
            action={handleModalClick}
            actionKey={handleModalKeyDown}
          />
        )}
      </main>
      <footer className={css.app_footer}>
        {isPages && (
          <Button
            label="Load more"
            action={handleLoadMore}
            formButton={false}
            id="loadmore"
          />
        )}
      </footer>
    </div>
  );
};

//------------------------------------------------------------------------------------

// Wyszukiwanie obrazów
// Utworzone zostało repozytorium goit-react-hw-04-images.
// Przeprowadź refaktor kodu zadania «Wyszukiwanie obrazów», wykorzystując hooki React.

// 2 - Wyszukiwanie obrazków
// Napisz aplikację do wyszukiwania obrazków po słowie kluczu. Preview roboczej aplikacji: zobacz odnośnik.
// https://drive.google.com/file/d/1oXCGyiq4uKwW0zzraZLKk4lh3voBlBzZ/view?usp=sharing

// Utwórz komponenty <Searchbar>, <ImageGallery>, <ImageGalleryItem>, <Loader>, <Button> i <Modal>. Gotowe style komponentów można wziąć z pliku styles.css i dostosować do siebie, jeśli jest to potrzebne.
// https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/goitacademy/react-homework/blob/master/homework-03/image-finder/styles.css

// Instrukcja Pixabay API
// Dla zapytań HTTP wykorzystaj publiczny serwis wyszukiwania obrazów Pixabay. Zarejestruj się i otrzymaj indywidualny klucz dostępu.

// Łańcuch URL zapytania HTTP.

// https://pixabay.com/api/?q=cat&page=1&key=your_key&image_type=photo&orientation=horizontal&per_page=12

// Pixabay API wspiera paginację, domyślnie parametr page jest równy 1. Niech w odpowiedzi przychodzi po 12 obiektów, ustanowionych w parametrze per_page. Nie zapomnij, że w trakcie wyszukiwania po słowie kluczu należy wyrzucać wartość page w 1.

// W odpowiedzi od api przychodzi tablica obiektów, w których ważne są dla ciebie tylko następujące właściwości.

// id - unikalny identyfikator
// webformatURL - odnośnik do miniatury dla listy obrazków
// largeImageURL - odnośnik do dużej wersji dla okna modalnego

// Opis komponentu <Searchbar>

// Komponent przyjmuje jeden props onSubmit - funkcję dla przekazania wartości input przy submicie formularza. Tworzy element DOM o następującej strukturze:

// <header class="searchbar">
//   <form class="form">
//     <button type="submit" class="button">
//       <span class="button-label">Search</span>
//     </button>

//     <input
//       class="input"
//       type="text"
//       autocomplete="off"
//       autofocus
//       placeholder="Search images and photos"
//     />
//   </form>
// </header>

// Opis komponentu <ImageGallery>
// Lista obrazków. Tworzy element DOM o następującej strukturze:

// <ul class="gallery">
//   <!-- Zbiór <li> z obrazami -->
// </ul>

// Opis komponentu <ImageGalleryItem>
// Komponent elementu listy z obrazkami. Tworzy element DOM o następującej strukturze:

// <li class="gallery-item">
//   <img src="" alt="" />
// </li>

// Opis komponentu <Button>
// Po naciśnięciu przycisku Load more powinna ładować się kolejna porcja obrazków i renderować się razem z poprzednimi. Przycisk powinien renderować się tylko wtedy, gdy istnieje jakieś obrazek do wyświetlenia. Jeśli tablica obrazków jest pusta, przycisk nie renderuje się.

// Opis komponentu <Loader>
// Komponent spinnera, wyświetlany jest w czasie ładowania obrazków. Wykorzystaj dowolny gotowy komponent, na przykład react-loader-spinner lub inny.
// https://github.com/mhnpd/react-loader-spinner

// Opis komponentu <Modal>
// Po kliknięciu na element galerii powinno otwierać się okno modalne z ciemnym tłem i wyświetlać się duża wersja obrazka. Okno modalne powinno zamykać się po naciśnięciu klawisza ESC lub po kliknięciu na tło.

// Wygląd podobny jest do tej funkcjonalności VanillaJS-плагина, ale zamiast białego okna modalnego renderuje się obrazek (kliknij na przykład Run). Nie trzeba tworzyć animacji.

// https://basiclightbox.electerious.com/

// <div class="overlay">
//   <div class="modal">
//     <img src="" alt="" />
//   </div>
// </div>

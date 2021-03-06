const autoCompleteConfig = {

    renderOption(movie){
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
        return `
            <img src="${imgSrc}"/>
            ${movie.Title}  (${movie.Year})
        `;
    },

    inputValue(movie){
        return movie.Title;
    },

    async fetchData(search){
        const responce = await axios.get('https://www.omdbapi.com/',{
            params: {
                apikey: '7abfb4ab',
                s: search
            }
        });
    
        if(responce.data.Error){
            return [];
        }
    
        return responce.data.Search;
    }
}


createAutoComplete({
    root : document.querySelector('#left-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'),'left');
    },
    ...autoCompleteConfig,

});

createAutoComplete({
    root : document.querySelector('#right-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    },
    ...autoCompleteConfig,

});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
    const responce = await axios.get('https://www.omdbapi.com/',{
        params: {
            apikey: '7abfb4ab',
            i: movie.imdbID
        }
    });

    summaryElement.innerHTML = movieTemplate(responce.data);

    if(side === 'left'){
        leftMovie = responce.data;
    }
    else{
        rightMovie = responce.data;
    }

    if(leftMovie && rightMovie){
        Compare(leftMovie,rightMovie);
    }  
};

const Compare = (leftMovie, rightMovie) => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index];

        const leftSideValue = parseFloat(leftStat.dataset.value);
        const rightSideValue = parseFloat(rightStat.dataset.value);


        if(rightSideValue > leftSideValue){
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warning');  
        }
        else{
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning');  
        }
    });
};



const movieTemplate = (movieDetail) => {

    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g,'').replace(/,/g,''));
    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g,''));

    const awards = movieDetail.Awards.split(' ').reduce((prev, word) =>{
        const value = parseInt(word);
        
        if(isNaN(value)){
            return prev;
        } 
        else{
            return prev + value;
        }

    }, 0);

    const template = `
        <article class="media">
        <figure class="media-left">
        <p class="image">
            <img src="${movieDetail.Poster}" />
        </p>
        </figure>
        <div class="media-content">
        <div class="content">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
        </div>
        </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="subtitle">Awards</p>
            <p class="title">${movieDetail.Awards}</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="subtitle">Box Office</p>
            <p class="title">${movieDetail.BoxOffice}</p>
        </article>
        <article data-value=${metascore} class="notification is-primary">
            <p class="subtitle">Metascore</p>
            <p class="title">${movieDetail.Metascore}</p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
            <p class="subtitle">IMDB Rating</p>
            <p class="title">${movieDetail.imdbRating}</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-primary">
            <p class="subtitle">IMDB Votes</p>
            <p class="title">${movieDetail.imdbVotes}</p>
        </article>
    `

    return template;
}
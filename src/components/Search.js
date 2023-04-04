import React, {useState, useEffect} from 'react';
import axios from 'axios';
import SearchIcon from './search.png';
import styles from './Search.module.css';

const Search = () => {
    const [term, setTerm] = useState('');
    const [results, setResults] = useState([]);

    useEffect(()=> {
        const search = async () => {
            const {data} =  await axios.get('https://mobile-staging.gametime.co/v1/search',{
                params: {
                    'q': term
                }
            })

            let organizedResults = []

            // if I was spending more time on this, I would move this data formatting into a reducer and into the app's store.
            // additionally, some of the data is not capitalized properly (categories like "music" are all lowercase, as is "mlb"
            // so, with more time, the reducer would also format those strings with proper capitalization

            for (let i=0; i<3; i++) {
                let event = data.events[i];
                if (event) {
                    event.type = "event";
                    event.name = event.event.name;
                    event.hero_image_url = event.performers[0].hero_image_url;
                    event.subtitle = event.venue.name;
                    event.id = event.event.id;
                    organizedResults.push(event)
                }
            }
            for (let i=0; i<3; i++) {
                let performer = data.performers[i];
                if (performer) {
                    performer.type = "performer";
                    performer.subtitle = performer.category;
                    organizedResults.push(performer)
                }
            }
            for (let i=0; i<3; i++) {
                let venue = data.venues[i];
                if (venue) {
                    venue.type = "venue";
                    venue.hero_image_url = venue.image_url;
                    venue.subtitle = venue.city;
                    organizedResults.push(venue)
                }
            }
            setResults(organizedResults);
        };

        if (term && !results.length) {
            search();
        } else if (!term) {
            setResults([])
        } else {
            const timeoutId = setTimeout(() => {
                if (term) {
                    search()
                }
            }, 500);

            return () => {
                clearTimeout(timeoutId)
            }
        }
    }, [term]);

    //in the rendered results as well as the jsx return statement, the images have empty strings for alt tags
    //this is because both images do not have additional meaning (the search icon is a redundancy of the aria label
    // "search", and the drop down has titles for what the images represent. the empty string allows screenreaders to
    // skip over reading them

    //Additionally, some of the photos are not the right proportions for a square thumbnail. In a professional
    // environment, I would ask about having thumbnail images, or finding another solution so the photos aren't
    // distorted on the drop down

    const renderedResults = results.map((result) => {
        return (
            <div className={styles["search-dropdown-item"]} key={result.id}>
                <img className={styles["search-dropdown-image"]} src={result.hero_image_url} alt="" />
                <div className={styles["search-dropdown-title"]}>
                    {result.name}
                </div>
                <div className={styles["search-dropdown-subtitle"]}>
                    {result.subtitle}
                </div>
            </div>
        )

    })

    return (
        <div className={styles["search-container"]}>
                <div className={styles["search-input-container"]}>
                    <img className={styles["search-icon"]} src={SearchIcon} alt="" />
                    <input
                        aria-label="Search term"
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        className={styles["search-input"]}
                    />
                </div>
            { results.length ?
            <div className={styles["search-dropdown"]}>
                {renderedResults}
            </div>
                : '' }
        </div>
    )
}

export default Search;

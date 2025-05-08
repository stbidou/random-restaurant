var nbrbar = 0;

function updateValueDisplay() {
            var rangeInput = document.getElementById('rangeInput');
            var valueDisplay = document.getElementById('valueDisplay');
            valueDisplay.textContent = rangeInput.value + "m";
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}

function getNearbyPlaces(userLocation, data) {
    const rangeValue = document.getElementById('rangeInput').value;
    const starRating = parseFloat(document.getElementById('star-rating').value);
    console.log(starRating)

    return data.filter(place => {
        const distance = calculateDistance(
            userLocation.latitude, userLocation.longitude,
            place.location.lat, place.location.lng
        );
        return distance <= rangeValue && place.totalScore >= starRating;
    });
}

function getRandomPlace(data) {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
}

function displayPlaceDetails(place) {
    const placeDetailsDiv = document.getElementById('place-details');

    placeDetailsDiv.innerHTML = `
        <a href="${place.url}" target="_blank" style="color: #ffd166; font-size: 1.4rem; font-weight: bold; text-decoration: none; display: block; text-align: center;">
            ${place.title} (${place.totalScore}★)
        </a>
        <div style="text-align: center; font-size: 0.60rem; color: #bbb; margin-top: 0.2rem;">
            ${nbrbar} bars dans la zone
        </div>
    `;
}

let placesData = null;

function loadPlacesData() {
    return fetch('restaurant.json')
        .then(response => response.json())
        .then(data => {
            placesData = data;
            return data;
        })
        .catch(error => {
            console.error('Erreur lors du chargement du fichier JSON:', error);
            throw error;
        });
}

function loadAndDisplayRandomNearbyPlace() {
    if (!placesData) {
        console.error('Les données des restaurants ne sont pas encore chargées.');
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        console.log(userLocation)
        const nearbyPlaces = getNearbyPlaces(userLocation, placesData);
        nbrbar = nearbyPlaces.length
        if (nbrbar > 0) {
            const randomPlace = getRandomPlace(nearbyPlaces);
            displayPlaceDetails(randomPlace);
        } else {
            console.warn('Aucun restaurant trouvé dans le rayon defini.');
            document.getElementById('place-details').innerHTML = '<p>Aucun restaurant trouvé dans le rayon défini.</p>';
        }
    }, error => {
        console.error('Erreur de géolocalisation:', error);
        document.getElementById('place-details').innerHTML = '<p>Erreur de géolocalisation. Impossible de trouver votre position.</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlacesData().then(loadAndDisplayRandomNearbyPlace);
});

document.getElementById('reload-btn').addEventListener('click', loadAndDisplayRandomNearbyPlace);
document.addEventListener('DOMContentLoaded', (event) => {
            document.getElementById('star-rating').addEventListener('change', loadAndDisplayRandomNearbyPlace);
        });

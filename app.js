// Data
const dallas = "Dallas, TX";
const cities = [
    { name: "New York, NY", dist: 220 }, // rough approx of flight minutes
    { name: "Los Angeles, CA", dist: 185 },
    { name: "Chicago, IL", dist: 135 },
    { name: "Houston, TX", dist: 65 },
    { name: "Phoenix, AZ", dist: 145 },
    { name: "Philadelphia, PA", dist: 195 },
    { name: "San Antonio, TX", dist: 65 },
    { name: "San Diego, CA", dist: 175 },
    { name: "Dallas, TX", dist: 0 },
    { name: "San Jose, CA", dist: 210 },
    { name: "Austin, TX", dist: 55 },
    { name: "Jacksonville, FL", dist: 140 },
    { name: "Fort Worth, TX", dist: 25 },
    { name: "Columbus, OH", dist: 135 },
    { name: "Indianapolis, IN", dist: 125 },
    { name: "Charlotte, NC", dist: 140 },
    { name: "San Francisco, CA", dist: 220 },
    { name: "Seattle, WA", dist: 235 },
    { name: "Denver, CO", dist: 120 },
    { name: "Washington, DC", dist: 165 },
    { name: "Tel-Aviv, Israel", dist: 750 }
].sort((a, b) => a.name.localeCompare(b.name));

const airlineNamesList = [
    "Soul", "Interior", "PlaneRed", "Northeast", "Europe", "Apart",
    "Hungarian Western", "Single Nation Flight Single", "American Northen",
    "CO2 Italy ABC", "Bolivian Flight", "CMC", "Gravity France",
    "Sing Some More Flights", "Air Hansa", "Country", "Asian Flightlines",
    "Barbra Atlantic", "Katara Flightways", "Seoul Oxygen",
    "Teatime Airplanes", "Vikings Plane"
];

let airlinesData = [];

// DOM Elements
const body = document.body;
const originSelect = document.getElementById("origin");
const destSelect = document.getElementById("destination");
const dateInput = document.getElementById("date");
const form = document.getElementById("search-form");
const loadingModal = document.getElementById("loading-modal");
const resultsSection = document.getElementById("results-section");
const flightsBody = document.getElementById("flights-body");

// Modal Elements
const detailsModal = document.getElementById("flight-details-modal");
const closeDetailsBtn = document.getElementById("close-details-btn");
const classButtonsContainer = document.getElementById("class-buttons");
const classSelectionContainer = document.getElementById("class-selection-container");
const paymentFrame = document.getElementById("payment-frame");

// Initialize
function init() {
    generateAirlineData();
    setThemeByTime();
    setMinDate();
    populateDropdowns();
    setupEventListeners();
}

function generateAirlineData() {
    airlinesData = airlineNamesList.map(name => {
        // Random days (1 to 7 working days)
        const daysCount = Math.floor(Math.random() * 7) + 1;
        const allDays = [0, 1, 2, 3, 4, 5, 6]; // 0=Sun
        const shuffledDays = allDays.sort(() => 0.5 - Math.random());
        const days = shuffledDays.slice(0, daysCount);

        // Random origins (subset of all cities besides Dallas)
        const otherCities = cities.filter(c => c.name !== dallas).map(c => c.name);
        // Ensure they support at least a few cities to keep results rich
        const minCities = Math.min(5, otherCities.length);
        const maxCities = otherCities.length;
        const citiesCount = Math.floor(Math.random() * (maxCities - minCities + 1)) + minCities;
        const shuffledCities = otherCities.sort(() => 0.5 - Math.random());
        const supportedOrigins = shuffledCities.slice(0, citiesCount);

        return { name, days, supportedOrigins };
    });
}

function setThemeByTime() {
    const hour = new Date().getHours();
    body.classList.remove('bg-day', 'bg-evening', 'bg-night');

    if (hour >= 6 && hour < 17) {
        // 6 AM to 4:59 PM
        body.classList.add('bg-day');
    } else if (hour >= 17 && hour < 20) {
        // 5 PM to 7:59 PM
        body.classList.add('bg-evening');
    } else {
        // 8 PM to 5:59 AM
        body.classList.add('bg-night');
    }
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

function populateDropdowns() {
    cities.forEach(city => {
        const optionO = document.createElement("option");
        optionO.value = city.name;
        optionO.textContent = city.name;
        originSelect.appendChild(optionO);

        const optionD = document.createElement("option");
        optionD.value = city.name;
        optionD.textContent = city.name;
        destSelect.appendChild(optionD);
    });
}

function setupEventListeners() {
    // Logic: If origin is NOT Dallas, destination MUST be Dallas.
    // And vice-versa.
    originSelect.addEventListener('change', (e) => {
        if (e.target.value !== dallas) {
            destSelect.value = dallas;
        }
    });

    destSelect.addEventListener('change', (e) => {
        if (e.target.value !== dallas) {
            originSelect.value = dallas;
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Ensure constraints one more time
        if (originSelect.value !== dallas && destSelect.value !== dallas) {
            alert("We only fly to or from Dallas, TX!");
            return;
        }
        if (originSelect.value === destSelect.value) {
            alert("Origin and destination cannot be the same!");
            return;
        }

        performSearch();
    });

    closeDetailsBtn.addEventListener('click', () => {
        detailsModal.classList.add('hidden');
    });
}

function performSearch() {
    // Hide results, show modal
    resultsSection.classList.add('hidden');
    loadingModal.classList.remove('hidden');

    // Random timeout between 4000 and 7000 ms
    const delay = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;

    setTimeout(() => {
        loadingModal.classList.add('hidden');
        generateResults();
        resultsSection.classList.remove('hidden');

        // Scroll to results smoothly
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, delay);
}

function generateResults() {
    flightsBody.innerHTML = '';

    // Determine distance based on non-dallas city
    const nonDallasCity = originSelect.value === dallas ? destSelect.value : originSelect.value;
    const cityData = cities.find(c => c.name === nonDallasCity);
    const baseDuration = cityData ? cityData.dist : 120; // fallback 120min

    // Parse the date to find day of week
    const dateVal = dateInput.value;
    const [yyyy, mm, dd] = dateVal.split('-');
    const dateObj = new Date(yyyy, mm - 1, dd);
    const selectedDayOfWeek = dateObj.getDay(); // 0-6

    // Filter available airlines for this route and date
    const availableAirlines = airlinesData.filter(a => {
        return a.days.includes(selectedDayOfWeek) && a.supportedOrigins.includes(nonDallasCity);
    });

    if (availableAirlines.length === 0) {
        flightsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No flights found for this route on this date! Try another day or city.</td></tr>';
        return;
    }

    // Generate 3 to 7 random flights based on availability
    const maxGen = Math.min(7, availableAirlines.length * 2);
    const minGen = Math.min(3, availableAirlines.length);
    const numFlights = Math.floor(Math.random() * (maxGen - minGen + 1)) + minGen;

    for (let i = 0; i < numFlights; i++) {
        // Randomize airline
        const airline = availableAirlines[Math.floor(Math.random() * availableAirlines.length)].name;

        // Randomize duration slightly (+/- 15 mins)
        const durationMins = baseDuration + Math.floor(Math.random() * 30) - 15;
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const durationStr = `${hours}h ${mins}m`;

        // Calculate price
        const factor = (Math.random() * (2.1 - 0.75)) + 0.75; // 0.75 to 2.1
        const price = Math.floor(durationMins * factor);

        // Build row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${airline}</strong></td>
            <td>${durationStr}</td>
            <td class="price">$${price}</td>
        `;

        tr.addEventListener('click', () => showFlightDetails(airline, durationStr, price));

        flightsBody.appendChild(tr);
    }
}

const flightClasses = [
    { name: "First class", factor: 10, icon: "star" },
    { name: "Business class", factor: 5, icon: "business_center" },
    { name: "Economy Plus", factor: 1.5, icon: "chair" },
    { name: "Economy", factor: 1, icon: "airline_seat_recline_normal" }
];

function showFlightDetails(airline, durationStr, basePrice) {
    // Populate details
    document.getElementById("details-airline-name").textContent = `${airline} Flight Details`;
    document.getElementById("details-duration").textContent = durationStr;
    document.getElementById("details-base-price").textContent = `$${basePrice}`;

    // Reset UI state
    classSelectionContainer.classList.remove('hidden');
    paymentFrame.classList.add('hidden');
    classButtonsContainer.innerHTML = '';

    // Pick random classes available (guarantee at least Economy)
    const availableClasses = flightClasses.filter(c => c.name === "Economy" || Math.random() > 0.3);

    availableClasses.forEach(cls => {
        const clsPrice = Math.floor(basePrice * cls.factor);

        const btn = document.createElement('button');
        btn.className = 'btn-class';
        btn.innerHTML = `
            <span class="material-icons">${cls.icon}</span>
            <span>${cls.name}</span>
            <span class="class-price">$${clsPrice}</span>
        `;

        btn.onclick = () => selectClass(cls.name, clsPrice);

        classButtonsContainer.appendChild(btn);
    });

    // Show modal
    detailsModal.classList.remove('hidden');
}

function selectClass(className, classPrice) {
    classSelectionContainer.classList.add('hidden');
    paymentFrame.classList.remove('hidden');

    document.getElementById("selected-class-name").textContent = className;
    document.getElementById("selected-class-price").textContent = `$${classPrice}`;
    document.getElementById("final-price").textContent = `$${classPrice}`;
}

// Run
window.onload = init;

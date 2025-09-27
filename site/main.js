document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('weather-form');
    const cityInput = document.getElementById('city-input');
    const weatherOutput = document.getElementById('weather-output');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const city = cityInput.value;
        weatherOutput.textContent = "Loading...";
        try {
            // Call Netlify Function
            const response = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();
            if (response.ok) {
                weatherOutput.innerHTML = `
                    <strong>Weather in ${data.city}:</strong> ${data.description}, ${data.temperature}°C
                `;
                // Plot temperature history if available
                if (data.history) {
                    Plotly.newPlot('plot', [{
                        x: data.history.dates,
                        y: data.history.temperatures,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Temperature'
                    }], { title: `Recent Temperatures in ${data.city}` });
                } else {
                    document.getElementById('plot').innerHTML = '';
                }
            } else {
                weatherOutput.textContent = data.error || "Could not fetch weather.";
                document.getElementById('plot').innerHTML = '';
            }
        } catch (err) {
            weatherOutput.textContent = "Error fetching weather.";
            document.getElementById('plot').innerHTML = '';
        }
    });
});
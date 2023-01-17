const chile = new Intl.NumberFormat("es-CL", { currency: "CLP", style: "currency" });
const usd = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });
const eur = new Intl.NumberFormat("en-US", { currency: "EUR", style: "currency" });
const miles = new Intl.NumberFormat("es-CL");
const apiURL = "https://mindicador.cl/api/";

async function getCurrencies() {
    try {
        const res = await fetch(apiURL);
        const currencies = await res.json();
        return currencies
    } catch (e) {
        let error = document.getElementById("moneda_elegida")
        error.innerText = `Error: ${e.message}`
    }
}

function disableButton(){
    let button = document.getElementById("convertir");
    button.disabled = true;
}

function enableButton(){
    let button = document.getElementById("convertir");
    button.disabled = false;
}

async function stateChange() {
    const currencies = await getCurrencies();

    let pesos = +(document.getElementById("cantidad").value)
    let pesoChileno = document.getElementById("peso_chileno")
    let newPesos = chile.format(pesos)
    let conversion = document.getElementById("moneda_elegida")
    let selectedCurrency = document.getElementById("moneda").value
    let index = document.getElementById("moneda").selectedIndex
    let nameCurrency = document.getElementById("moneda").options[index].innerText
    let currencyHistory = document.getElementById("currencyHistory")
    
    currencyHistory.innerText = `${nameCurrency}, últimos 10 días`
    
    pesoChileno.innerText = newPesos + " ="
    conversion.innerText = "..."

    if (!currencies[selectedCurrency]) {
        alert(`La moneda ${selectedCurrency} no existe`)
        disableButton();
        return
    }
    enableButton()
}

let btnConvertir = document.getElementById("convertir");
btnConvertir.addEventListener("click", convertir);

async function convertir() {
    const currencies = await getCurrencies();
    let pesos = +(document.getElementById("cantidad").value)
    let conversion = document.getElementById("moneda_elegida")
    let selectedCurrency = document.getElementById("moneda").value

    valorConvertido = pesos / +(currencies[selectedCurrency].valor)
    
    switch (selectedCurrency) {
        case "dolar":
            conversion.innerText = usd.format(valorConvertido);
            break;

        case "euro":
            conversion.innerText = eur.format(valorConvertido);
            break;

        case "uf":
            conversion.innerText = miles.format(valorConvertido) + " UF";
            break;

        case "utm":
            conversion.innerText = miles.format(valorConvertido) + " UTM";
            break;
    }
}

let myChart = null

async function getCurrencyHistorical() {
    stateChange()
    let selectedCurrency = document.getElementById("moneda").value
    const apiCurrency = `https://mindicador.cl/api/${selectedCurrency}`
    try {
        const res = await fetch(apiCurrency);
        const currencyHistorical = await res.json();
        return currencyHistorical.serie.slice(0, 10).reverse()
    } catch (e) {
        let error = document.getElementById("moneda_elegida")
        error.innerText = `Error: ${e.message}`
    }
}

function confChart(a) {
    const type = "line"
    const days = a.map((day) => day.fecha.substring(0,10))
    const titulo = "Valor"
    const colorLinea = "#005bea"
    const valores = a.map((price) => price.valor)

    const config = {
        type: type,
        data: {
            labels: days,
            datasets : [
                {
                    label: titulo,
                    backgroundColor: colorLinea,
                    data: valores
                }
            ]
        }
    }
    return config
}

async function renderChart() {
    const currencyHistorical = await getCurrencyHistorical()
    const config = confChart(currencyHistorical)
    const chartDOM = document.getElementById("myChart")

    if (myChart != null) {
        myChart.destroy()
    }
    myChart = new Chart(chartDOM, config)
}

renderChart()
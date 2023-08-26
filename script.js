const currencyConverter = {


	defaultBaseCurrencyCode: "JMD",

	locationCurrApiKey: "4588a4af48694c3588591ea148aafc881ae5012e5afa28daf80a692d",
	locationBaseURL: "https://api.ipdata.co",

	currencyApiBaseURL: "https://api.currencylayer.com",
	currencyApiKey: "816aace5f867a203d108dde0987d9681",

	toBeConverted: document.querySelector("#baseCurrency"),
	isConvertedTo: document.querySelector("#outputCurrency"),
	fromInput: document.querySelector("#baseAmount"),
	toOutput: document.querySelector("#result"),

	exchangeRate: "",
	convertedValue: "",


	fromCurrency: "",
	targetCurrency: "",
	baseValue: 0,

	currencyList: {},

	conversionResult: "",
	toValue: "",

	firstLine: document.querySelector("#firstLine"),
	secondLine: document.querySelector("#secondLine"),

	startDate: "",
	pastDates: [],

	date1: "",
	date2: "",
	date3: "",
	date4: "",
	date5: "",
	date6: "",

	datesArray: [],
	ratesArray: [],
	currentDate: "",




	detectLocalCurr() {
		return `${this.locationBaseURL}/currency?api-key=${this.locationCurrApiKey}`;
	},

	getCurrencies() {
		return `${this.currencyApiBaseURL}/list?access_key=${this.currencyApiKey}`;
	},

	currencyConvert(from = this.fromCurrency, to = this.targetCurrency, amount = this.baseValue) {
		return `${this.currencyApiBaseURL}/convert?from=${from}&to=${to}&amount=${amount}&access_key=${this.currencyApiKey}`;
	},

	getHistoricalRates(date = this.startDate, from = this.fromCurrency, to = this.targetCurrency) {
		return `${this.currencyApiBaseURL}/historical?date=${date}&source=${from}&currencies=${to}&access_key=${this.currencyApiKey}`;
	},

	async getCurrencyList() {
		const response = await fetch(this.getCurrencies());
		const result = await response.json();
		return result.currencies;

	},

	async getUserLocationCurrency() {
		const response = await fetch(this.detectLocalCurr());
		const result = await response.json();
		return result;
	},


	async getExchangeRate(from, to) {
		const amount = 1;
		const result = await fetch(this.currencyConvert(from, to, amount));
		const resultRate = await result.json();
		return resultRate;
	},

	async renderExchangeRate(from, to) {
		this.exchangeRate = await this.getExchangeRate(from, to);
		this.firstLine.innerHTML = `1 ${from} ==> ${this.exchangeRate.result} ${to}`;
		const rateOfExchange = this.exchangeRate;
		return rateOfExchange.result;
	},


	async init() {
		// display default rates on page load
		window.addEventListener("load", async () => {
			this.defaultRates();
		});


		//stores the result of the json currency list in a variable, so tha that the function is called only once
		this.currencyList = await this.getCurrencyList();

		//populates the select fields
		this.addOptions(this.toBeConverted);
		this.addOptions(this.isConvertedTo);

		//adding event listeners to the three inputs and result output
		this.toBeConverted.addEventListener("change", () => {
			//this.clearRateDisplay();
			this.fromCurrency = this.toBeConverted.value;
			this.targetCurrency = "";
			this.doConversion();
		});

		this.isConvertedTo.addEventListener("change", () => {
			this.targetCurrency = this.isConvertedTo.value;
			this.doConversion();
		});

		this.fromInput.addEventListener("change", () => {
			this.baseValue = this.fromInput.value;
			this.doConversion();
		});

		this.getPast6Months();
	},


	// function to create, add a value and inner html to option element
	addOptions(selectOption) {
		for (const countryCode in this.currencyList) {
			const option = document.createElement("option");
			option.value = countryCode;
			option.innerText = countryCode + "-" + this.currencyList[countryCode];
			selectOption.add(option);
		};
	},

	//fetches the default rates from API for JMD and GBP
	async defaultRates() {
		this.fromCurrency = "JMD";
		this.targetCurrency = "GBP";
		this.baseValue = 1;
		const response = await fetch(this.currencyConvert(this.fromCurrency, this.targetCurrency, this.baseValue));
		const result = await response.json();
		this.firstLine.innerHTML = "1 JMD equals";
		this.secondLine.innerHTML = `${result.result} GBP`;
	},

	//converting two currencies
	async doConversion() {
		if (this.fromCurrency && this.targetCurrency && this.baseValue >= 0) {
			//fetch currency conversion from API and store in variable "response"
			const response = await fetch(this.currencyConvert(this.fromCurrency, this.targetCurrency, this.baseValue));
			const result = await response.json();

			// outputs result to display to 2 decimal places
			this.toOutput.innerHTML = (result.result);

			this.firstLine.innerHTML = `1 ${this.fromCurrency} equals`;
			this.secondLine.innerHTML = `${(result.result) / this.baseValue} ${this.targetCurrency}`;

			this.getPastRates();
		};
	},


	async getPastRates() {
		this.ratesArray = [];

		for (const date of this.pastDates) {
			const response = await fetch(this.getHistoricalRates(date));
			const results  = await response.json();

			for (const key in results.quotes) {
				this.ratesArray.push(results.quotes[key]);
			};
		}

		console.log(this.ratesArray);
	},

	// generates date format
	pastDate(dateNow) {
		this.dateNow = this.startDate;
		const date = new Date();
		date.setDate(date.getDate() - dateNow);
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let year = date.getFullYear();

		if (month < 10) {
			month = `0${month}`;
		};

		if (day < 10) {
			day = `0${day}`;
		};

		let result = `${year}-${month}-${day}`;
		this.pastDates.push(result);

		return this.pastDates;
	},

	//generates 6 dates 1 month apart
	getPast6Months() {
		this.pastDates = [];
		for (let dateNow = 0; dateNow < 180; dateNow += 30) {
			this.pastDate(dateNow);
		};
		this.pastDates.reverse();

		this.currentDate = this.pastDates[5];

		console.log(this.pastDates);
		return this.pastDates;
	}
};

currencyConverter.init();

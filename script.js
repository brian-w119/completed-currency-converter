const currencyConverter = {


    defaultBaseCurrencyCode : "JMD",
  
    locationCurrApiKey      : "4588a4af48694c3588591ea148aafc881ae5012e5afa28daf80a692d",
    locationBaseURL         : "https://api.ipdata.co",
  
    currencyApiBaseURL      : "https://api.currencylayer.com",
    currencyApiKey          : "816aace5f867a203d108dde0987d9681",
  
    toBeConverted           : document.querySelector("#baseCurrency"),
    isConvertedTo           : document.querySelector("#outputCurrency"),
    fromInput               : document.querySelector("#baseAmount"),
    toOutput                : document.querySelector("#result"),
  
    exchangeRate            : "",
    convertedValue          : "",
    
  
    fromCurrency            : "",
    targetCurrency          : "",
    baseValue               : 0,
  
    currencyList            : {},
  
    conversionResult        : "",
    toValue                 : "",
  
    firstLine               : document.querySelector("#firstLine"),
    secondLine              : document.querySelector("#secondLine"),
  
    startDate               : "",
    answer                  : [],
  
    date1                   : "",
    date2                   : "",
    date3                   : "",
    date4                   : "",
    date5                   : "",
    date6                   : "",
  
    datesArray              : [], 
    currentDate             : "", 
    
  
  
  
      detectLocalCurr(){
        return `${this.locationBaseURL}/currency?api-key=${this.locationCurrApiKey}`;
      },
  
      getCurrencies(){
        return `${this.currencyApiBaseURL}/list?access_key=${this.currencyApiKey}`;
      },
  
      currencyConvert(from, to, amount){
        return `${this.currencyApiBaseURL}/convert?from=${this.fromCurrency}&to=${this.targetCurrency}&amount=${this.baseValue}&access_key=${this.currencyApiKey}`;
      },
      
      getHistoricalRates(from, to, date){
      return `${this.currencyApiBaseURL}/historical?date=${this.startDate}&source=${this.fromCurrency}&currencies=${this.targetCurrency}&access_key=${this.currencyApiKey}`;
      },
    
      async getCurrencyList(){
         const response = await fetch( this.getCurrencies() );
         const result = await response.json();
         return result.currencies;
         
      },
  
      async getUserLocationCurrency(){
        const response = await fetch(this.detectLocalCurr());
        const result = await response.json();
        return result;
      },
  
  
      async getExchangeRate(from, to){
        const amount = 1;
        const result = await fetch(this.currencyConvert(from, to, amount));
        const resultRate = await result.json();
        return resultRate;
      },
  
      async renderExchangeRate(from, to){  
        this.exchangeRate = await this.getExchangeRate(from, to);
        this.firstLine.innerHTML = `1 ${from} ==> ${this.exchangeRate.result} ${to}`;
        const rateOfExchange = this.exchangeRate;
        return rateOfExchange.result;
      },
    
      
    async init(){
      
      // display default rates on page load
      window.addEventListener("load", async ()=>{
        this.defaultRates();
      });
      
  
        //stores the result of the json currency list in a variable, so tha that the function is called only once
        this.currencyList = await this.getCurrencyList(); 
  
        //populates the select fields
        this.addOptions(this.toBeConverted);
        this.addOptions(this.isConvertedTo);
  
        //adding event listeners to the three inputs and result output
        this.toBeConverted.addEventListener("change", ()=> {
          //this.clearRateDisplay();
           this.fromCurrency = this.toBeConverted.value;
           this.targetCurrency = "";  
           this.doConversion();
        });
  
        this.isConvertedTo.addEventListener("change", ()=> {
            this.targetCurrency = this.isConvertedTo.value;
            this.doConversion();
        });
  
        this.fromInput.addEventListener("change", ()=> {
           this.baseValue = this.fromInput.value;
           this.doConversion();
        });
  
        this.getPast6Months();
    },
  
  
    // function to create, add a value and inner html to option element
    addOptions(selectOption){
      for(const countryCode in this.currencyList){
          const option = document.createElement("option");
          option.value = countryCode;
          option.innerText = countryCode + "-" + this.currencyList[countryCode];
          selectOption.add(option);
          };
    },
  
  //fetches the default rates from API for JMD and GBP
  async defaultRates(){
    this.fromCurrency = "JMD";
    this.targetCurrency = "GBP";
    this.baseValue = 1;
    const response = await fetch(this.currencyConvert(this.fromCurrency, this.targetCurrency, this.baseValue));
    const result = await response.json();
    this.firstLine.innerHTML = "1 JMD equals";
    this.secondLine.innerHTML = `${result.result} GBP`;
  },
  
    //converting two currencies
    async doConversion(){
      if(this.fromCurrency && this.targetCurrency && this.baseValue >= 0){
        //fetch currency conversion from API and store in variable "response"
        const response = await fetch(this.currencyConvert(this.fromCurrency, this.targetCurrency, this.baseValue));
        const result = await response.json();
  
        // outputs result to display to 2 decimal places
        this.toOutput.innerHTML = (result.result);
        
        this.firstLine.innerHTML = `1 ${this.fromCurrency} equals`;
        this.secondLine.innerHTML = `${(result.result)/this.baseValue} ${this.targetCurrency}`;
  
        this.getPastRates();   
        this.dateChange();
  
        console.log(result.result);
      };
    },
  
     
    async getPastRates(){
      this.startDate = this.currentDate;
      const response = await fetch(this.getHistoricalRates(this.fromCurrency, this.targetCurrency,this.startDate));
      const results = await response.json();
   
      let historicalConversion = null;
      for (const key in results.quotes) {
       historicalConversion = results.quotes[key];
       console.log(`${historicalConversion} - historical conversion`);
       return historicalConversion;
      };
     
    },
  
    // generates date format
    pastDate(dateNow){
      this.dateNow = this.startDate;
      const date = new Date();
      date.setDate(date.getDate() - dateNow);
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let year = date.getFullYear();
     
       if(month < 10){
          month = `0${month}`;
     };
     
       if(day < 10){
          day = `0${day}`;
     };
     
     let result = `${year}-${month}-${day}`;
     this.answer.push(result);
     
     return this.answer;
    },
   
    //generates 6 dates 1 month apart
   getPast6Months(){
     this.answer = [];
     for(let dateNow = 0; dateNow < 180; dateNow += 30){
       this.pastDate(dateNow);
     };
     this.answer.reverse();
     
     /*
     this.date1 = this.answer[0];
     this.date2 = this.answer[1];
     this.date3 = this.answer[2];
     this.date4 = this.answer[3];
     this.date5 = this.answer[4];
     this.date6 = this.answer[5];
     */
  
     this.currentDate = this.answer[5];
     
     console.log(this.answer);
     return this.answer;
   },
  
   //generates the 6 past exchange rates
   async dateChange(){
    for(let change = 0; change < 6; change++){
       this.startDate = this.answer[change];
       let x = this.getPastRates();
       this.datesArray.push(x);
    };
    console.log(this.datesArray);
  },
   
   /*
   loadChart(){
    google.charts.load('current',{packages:['corechart']});
    google.charts.setOnLoadCallback(this.drawChart);
   },
  
   drawChart(){
  
    const data = google.visualization.arrayToDataTable([
      ["Rate", "Date"],
     [, 1], [1.5, 2], [2.7, 3], [3.4, 4], [4, 5], [5.9, 6]
  
    ]);
  
  
   },
   */
   
  
  };
  
  currencyConverter.init();
  
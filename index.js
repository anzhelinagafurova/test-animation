let dataSet = new Set(); // исключаем одинаковые значения

const squares = document.querySelectorAll(".square-container__square");

async function fillFirstInput(){ // начальное заполнение первого поля 
    const data = await getData();
    dataSet = new Set();
    data.forEach((auto) => {
        dataSet.add(auto["mark"]); // заполняем сет марок машин
    })
    renderInputs(dataSet, "autoMark");
}
async function handleModel(){ // на выбранную марку машины подбираем значения доступных моделей
    const mark = this.event.target.value;
    dataSet = new Set(); // т.к. везде используется одна и та же переменная, обнуляем сет
    const data = await getData();
    Object.values(data).forEach((auto) => { 
        if(auto["mark"] == mark){ // проверка на соответствие данных
            dataSet.add(auto["model"]); // заполняем сет моделей машин
        }
    })
    renderInputs(dataSet, "autoModel"); //рендер второго поля
    renderInputs([], "autoYear"); //обнуляем список для третьего поля, т.к. второе еще не заполнено
}
async function handleYear(){ // на выбранную марку и модель машины подбираем значения доступных годом производства
    const model = this.event.target.value;
    dataSet = new Set();
    const data = await getData();
    const mark = document.getElementById("autoMark").value;
    Object.values(data).forEach((auto) => {
        if(auto["mark"] == mark && auto["model"] == model){ // проверка на соответствие данных
            dataSet.add(auto["year"]); // заполняем сет годов производства машин
        }
    })
    renderInputs(dataSet, "autoYear"); // рендер третьего поля
}
async function handleCalendar(){
    const data = await getData();
    const mark = document.getElementById("autoMark").value;
    const model = document.getElementById("autoModel").value;
    const year = document.getElementById("autoYear").value;
    Object.values(data).forEach((auto) => {
        if(auto["mark"] == mark && auto["model"] == model && auto["year"] == year){ // проверка на соответствие данных
            popUp.hidden = false;
            let dates = parseDate(auto["delivery"]);
            calendar.min = dates[0];
            calendar.max = dates[1];
            calendar.value = dates[0];

        }
    })
}
function parseDate(date){ //приводим дату из json к нужному html-формату
    date = date.split('-');
    date = date.map(function(elem){
        return elem.split('.').reverse().join("-")
    })
    return date;
}
function unparseDate(date){ //приводим дату из html к нужному json-формату
    date = date.split('-').reverse().join(".");
    return date;
}
async function getData() { //получает данные из json-файла и возвращает массив данных
    let response = await fetch('./data.json');
    let data = await response.text();
    data = await JSON.parse(data);
    return Object.values(data)
}

function renderInputs(options, selectId){ //получает набор элементов option и составляет новый select 
    let firstChild = document.getElementById(selectId).children[0];
    document.getElementById(selectId).innerHTML = ""; //удаление прошлых полей при новом рендере
    document.getElementById(selectId).append(firstChild); //добавление дефолтного поля
    for (let option of options){ //создание нового поля option и добавление в select
        let optionDOM = document.createElement('option');
        optionDOM.innerHTML = option;
        document.getElementById(selectId).append(optionDOM);      
    }  
}
function showCalendar(){
    calendar.style.display="block";
    checkCalendar();
}
function checkCalendar(){
    if(calendar.value != ""){
        handleCircleData([
            document.getElementById("autoMark").value,
            document.getElementById("autoModel").value,
            document.getElementById("autoYear").value
        ]);
    }
}
function handleCircleData(data){ // заполнение данных круга после заполнения полей
    let delivery = calendar.value;
    delivery = unparseDate(delivery);
    const info = `Вы выбрали ${data[0]}, ${data[1]}, ${data[2]}. <br> Доставка ${delivery} <br> Начать заново`;
    circle.innerHTML = info;
    circle.classList.remove("circle-animated");
    circle.addEventListener("click", startAnimation);
}
function handleCircleLink(event){   
    event.target.addEventListener("click", startForm);
}
function startForm(){
    selectionForm.style.display = "flex";
    squareContainer.style.position = "static";
    circle.removeEventListener("click", startForm);

    squares.forEach((e) => {
        e.classList.toggle("square-animated");
    })

    mainContainer.style.height = "auto";
    document.body.style.overflowX = "auto"; //возващаем полосы прокрутки после анимации квадратов
    document.body.style.overflowY = "auto";

    fillFirstInput();
}
function hideElement(event){
    event.target.style.display = "none";
}
function startAnimation(){
    squares.forEach((e) => {
        e.style.display = "block";
        e.classList.toggle("square-animated");
    })
    mainContainer.style.height = "100vh";
    squareContainer.style.position = "absolute";

    document.body.style.overflowX = "hidden"; //скрываем полосы прокрутки для анимации квадратов
    document.body.style.overflowY = "hidden";

    circle.innerHTML = "Начать";
    circle.classList.add("circle-animated");
    circle.removeEventListener("click", startAnimation);

    selectionForm.style.display = "none";
    calendar.style.display="none";
    popUp.hidden = true;

    renderInputs([], "autoMark"); // опустошаем поля селектов для случая повторного запуска
    renderInputs([], "autoModel"); 
    renderInputs([], "autoYear");
    handleCalendar();
}
circle.addEventListener("webkitAnimationEnd", handleCircleLink);  // для Chrome, Safari и Opera
circle.addEventListener("animationend", handleCircleLink); 
squares.forEach((e) => {
    e.addEventListener("webkitAnimationEnd", hideElement);
    e.addEventListener("animationend", hideElement);
})
startAnimation();
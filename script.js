'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deletAllbtn = document.querySelector('.DeletAll');
const deletbtn = document.querySelector('.btn-delete');
const editbtn = document.querySelector('.btn-edite');
const SumbitBtn = document.querySelector('.form__btn');


let workout;

alert('Click on the map to start adding note')
class Workout {
    date = new Date()
    id = Date.now() + ''.slice(-10)

    constructor(coords, destance, duration) {
        this.coords = coords
        this.destance = destance
        this.duration = duration

    }
    _setDiscription() {
        this.discription = ` ${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()] + ' ' + this.date.getDate()}`
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, destance, duration, cadence) {
        super(coords, destance, duration)
        this.cadence = cadence
        this.calcPace()
        this._setDiscription()
    }

    calcPace() {
        //min/km
        this.pace = this.destance / this.duration
    }
}

class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, destance, duration, elevationGain) {
        super(coords, destance, duration)
        this.elevationGain = elevationGain
        this.calcSpead()
        this._setDiscription()

    }
    calcSpead() {
        //km/h
        this.spead = this.duration / (this.destance / 60)
    }
}

////APLICATION////////////////////////////

class App {
    #map;
    #mapEvent;
    #workouts = [];
    workoutEl;
    workout;
    id = Date.now() + ''.slice(-10)

    constructor() {
        //get position
        this._getPosition();
        //getData
        this._getStorageData()
        //event Handing in event listener we shoud bind this
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', this._toggleElevationField)
        containerWorkouts.addEventListener('click', this._moveToPupup.bind(this))
        // delet_btn?.addEventListener('click',this._deletList.bind(this))
        // editbtn.addEventListener('click',this._editbtn.bind(this))
        deletAllbtn.addEventListener('click', this.reset.bind(this))

    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._LoadMap.bind(this), function () {
          alert('Could not get your position');
                
            })
        }
    }

    _LoadMap(positoin) {
        const { latitude } = positoin.coords;
        const { longitude } = positoin.coords;
        const Coords = [latitude, longitude]
        this.#map = L.map('map').setView(Coords, 13);
        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // L.marker(Coords).addTo(this.#map).bindPopup('Herat!').openPopup();

        this.#map.on('click', this._showForm.bind(this))

        //  after map loaded show the workoutMarker
        
        this.#workouts.forEach(work => {
            this._RenderWorkoutMarker(work)
        })
    }


    _showForm(mapE) {
        
        form.classList.remove('hidden')
        inputDistance.focus()
        this.#mapEvent = mapE
    }


    _hiddenForm() {
        //remove input value
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ''
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => form.style.display = 'grid', 1000);
    }


    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }


    _newWorkout(e) {
        e.preventDefault()
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const PositiveNumber = (...inputs) => inputs.every(inp => inp > 0)

        // get data from form
        const type = inputType.value
        const destance = +inputDistance.value
        const duration = +inputDuration.value;
        var { lat, lng } = this.#mapEvent.latlng;

        //create runing obj if workout is runing
        if (type == 'running') {
            const cadence = +inputCadence.value
            //check for validation
            if (!validInput(cadence, duration, destance) || !PositiveNumber(cadence, duration, destance)) return alert('All inputs should be positive numbers !')
            workout = new Running([lat, lng], destance, duration, cadence)
            workout.id = this.id
        }
        //create cycling obj if workout is cycling
        if (type == 'cycling') {
            const elevation = +inputElevation.value
            if (!validInput(elevation, duration, destance) || !PositiveNumber(duration, destance)) return alert('inputs shoud be posive')
            workout = new Cycling([lat, lng], destance, duration, elevation)
            workout.id = this.id
        }

        this.#workouts.push(workout)
        //render workout in map
        this._RenderWorkoutMarker(workout)
        //render workout on List
        this._RenderWorkout(workout)
        //clean form
        this._hiddenForm()
        //store data
        this._setLocalStorage()
    }


    _RenderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`
                })
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.discription}`)
            .openPopup();
    }

    _RenderWorkout(workout) {

        let html = `
             <li class="workout workout--${workout.type}" data-id="${workout.id}">
             <h2 class="workout__title">${workout.discription}</h2>
             <div class="workout__details">
               <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'}</span>
               <span class="workout__value">${workout.destance}</span>
               <span class="workout__unit">km</span>
             </div>
             <div class="workout__details">
               <span class="workout__icon">⏱ </span>
               <span class="workout__value"> ${workout.duration}</span>
               <span class="workout__unit">min</span>
             </div>
             `
        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
            </div>

                `
        }
        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.spead.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
              </div>
            </div>
                `
        }
        form.insertAdjacentHTML('afterend', html)
    }

    _moveToPupup(e) {
  
    if(e.target.className=='delet') this._deletList()
    
        if (!this.#map) return;
        this.workoutEl = e.target.closest('.workout')
        if (!this.workoutEl) return;

        const workout = this.#workouts.find(work => work.id === this.workoutEl.dataset.id)

        this.#map.setView(workout.coords, 13, {
            Animation: true,
            pan: {
                duration: 1
            }
        })
    }


    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }

    _getStorageData() {
        
        const data = JSON.parse(localStorage.getItem('workouts'))

        if (!data) return;

        this.#workouts = data
        this.#workouts.forEach(work => {
            this._RenderWorkout(work)
        })
    }

    // _deletList(e){
    //     console.log('clicked Delet');
    //     const deletWorkout = this.#workouts.find(work => work.id === this.workoutEl.dataset.id)
    //     const update = this.#workouts.filter(workout=>workout.coords[0]!==deletWorkout.coords[0])
    //     localStorage.setItem('workouts', JSON.stringify(update))
    //     this.#workouts = update
        
    // }

    reset() {
        localStorage.removeItem('workouts')
        location.reload()
    }
}

const app = new App()


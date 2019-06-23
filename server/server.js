// const express = require('express');
// const morgan = require('morgan');

// const app = express();

// app.use(morgan('dev'));
// app.use(express.static('dist'));
// app.use(express.static('public'));

// module.exports = app;

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

var toDoArr = [];

    //Initial values for testing
    // [
    //     {
    //         id: 0,
    //         text: 'an item',
    //         priority: '3',
    //         value: false
    //     },
    //     {
    //         id: 1,
    //         text: 'another item',
    //         priority: '2',
    //         value: false
    //     },
    //     {
    //         id: 2,
    //         text: 'a done item',
    //         priority: '1',
    //         value: true
    //     }
    // ];

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(express.static('dist'));
app.use(express.static('public'));

app.get('/api/TodoItems/?$', (req, res) => {
    res.status(200).send(toDoArr);
});

app.get('/api/TodoItems/[0-9]+', (req, res) => {
    var id = req.url.match(/[0-9]+/);
    if (id != null) {
        id = id[0];
        toDoArr.forEach((element) => {
            if (!res.finished && element.id == id) res.status(200).send(element);
        });
    }
    if (!res.finished) res.status(500).send('Error: The requested id does not exist');
});

app.post('/api/TodoItems/?$', (req, res) => {
    var newObj = req.body;
    console.log(newObj);
    if (newObj == undefined || newObj.id == undefined || newObj.text == undefined || newObj.priority == undefined || newObj.value == undefined) res.status(500).send('Error: Invalid POST request');
    if (!res.finished) {
        toDoArr.forEach((element, index) => {
            if (!res.finished && element.id == newObj.id) {
                toDoArr[index] = newObj
                res.status(201).send(newObj);
            }
        });
    }
    if (!res.finished) {
        toDoArr[toDoArr.length] = newObj
        res.status(201).send(newObj);
    }

    //Added a cap of 50 to the length of the array for the now deploy
    if(toDoArr.length > 50) {
    let index = 0;
    toDoArr.shift;
    toDoArr.forEach((element) => {
        element.id = index;
        index++;
    } 
    );}
});

app.delete('/api/TodoItems/[0-9]+', (req, res) => {
    var id = req.url.match(/[0-9]+/);
    if (id != null) {
        id = id[0];
        var tempArr = [];
        let index = 0;
        toDoArr.forEach((element) => {
            if (!res.finished && element.id == id) res.status(200).send(element)
            else {
                element.id = index;
                tempArr.push(element);
                index++;
            } 
        });
        toDoArr = tempArr;
    }
    if (!res.finished) res.status(500).send('Error: The requested id does not exist');
});

app.get('*', (req, res) => {
    res.status(404).send('404: Resource not found');
})

module.exports = app;

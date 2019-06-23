import React, { Component } from 'react';
import axios from 'axios';

function handlePrio(prio) {
  switch (prio) {
    case '1': return 'danger';
    case '2': return 'warning';
    case '3': return 'success';
    default: return 'info';
  }
}

class Input extends Component {
  render() {
    return (
      <div className='col-sm-4'>
        <div className='panel panel-default' style={{ position: 'sticky' }}>
          <div className='panel-heading'>Add New Todo</div>
          <div className='panel-body'>
            <label htmlFor='todo-text-in'>I want to...</label>
            <textarea id='todo-text-in' className='create-todo-text form-control' rows='4' value={this.props.text} onChange={(e) => this.props.update('textIn', e.target.value)}></textarea>
            <label htmlFor='todo-prio-select' style={{ marginTop: '0.5rem' }}>How much of a priority is this?</label>
            <select id='todo-prio-select' className='create-todo-priority form-control' value={this.props.prio} onChange={(e) => this.props.update('prioIn', e.target.value)}>
              <option value='1'>High Priority</option>
              <option value='2'>Moderate Priority</option>
              <option value='3'>Low Priority</option>
            </select>
          </div>
          <div className='panel-footer'>
            <button className='create-todo btn btn-success btn-block btn-lg' onClick={this.props.add}>Add</button>
          </div>
        </div>
      </div>
    )
  }
}

class TodoItem extends Component {
  render() {
    return (
      <li className={`list-group-item list-group-item-${handlePrio(this.props.el.priority)}`}>
        <form className='form-inline'>
          <div className='form-group'>
            <input type='checkbox' checked={this.props.el.value} onChange={() => this.props.boxClick(this.props.index)}></input>
          </div>
          <div className='form-group' style={{ width: '85%' }}>
            <h5>{this.props.el.text}</h5>
          </div>
          <div className='form-group' style={{ marginRight: '1.5rem' }}>
            <span className='edit-todo glyphicon glyphicon-edit text-primary' onClick={() => this.props.setEdit(this.props.index)}></span>
          </div>
          <div className='form-group'>
            <span className='delete-todo glyphicon glyphicon-trash text-danger' onClick={() => this.props.remove(this.props.index)}></span>
          </div>
        </form>
      </li>
    )
  }
}

class EditTodo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: this.props.el.text,
      prio: this.props.el.priority,
      value: this.props.el.value
    }
  }

  updateInput(field, event) {
    this.setState({
      [field]: event.target.value
    });
  }

  render() {
    return (
      <li className={`list-group-item list-group-item-${handlePrio(this.state.prio)}`}>
        <label htmlFor='editDesc'>Description</label>
        <textarea value={this.state.text} className='update-todo-text form-control' id='editDesc' rows='4' onChange={(e) => this.updateInput('text', e).target.value}></textarea>
        <label htmlFor='editPrio' style={{ marginTop: '0.5rem' }}>Priority</label>
        <select value={this.state.prio} className='update-todo-priority form-control' id='editPrio' onChange={(e) => this.updateInput('prio', e).target.value}>
          <option value='1'>High Priority</option>
          <option value='2'>Moderate Priority</option>
          <option value='3'>Low Priority</option>
        </select>
        <div className='btn-group' role='group' style={{ marginTop: '0.5rem' }}>
          <button type='button' className='update-todo btn btn-success' onClick={() => this.props.save(true, this.state.text, this.state.prio, this.state.value)}>Save</button>
          <button type='button' className='btn btn-danger' onClick={() => this.props.save(false)}>Cancel</button>
        </div>
      </li>
    )
  }
}

class Control extends Component {
  render() {
    return (
      <div className='panel-footer'>
        <div className='row'>
          <div className='col-sm-12'>
            <input type='checkbox' checked={this.props.sortBox} onChange={() => this.props.update('sort', this.props.sortBox == false ? true : false)} />Sorting by {this.props.sortBox == true ? <span>id</span> : <span>priority</span>}
          </div>
        </div>
      </div>
    )
  }
}

class Output extends Component {
  renderItems() {
    return (this.props.todo.map((el, index) => index != this.props.edIn ? (
      <TodoItem key={el.text + '' + index}
        el={el}
        index={index}
        setEdit={this.props.setEdit}
        remove={this.props.remove}
        boxClick={this.props.boxClick}
      />
    ) : (
        <EditTodo key={el.text + '' + index}
          el={el}
          index={index}
          save={this.props.save}
        />
      )));
  }

  renderPriority(priority) {
    return (this.props.todo.map((el, index) => el.priority == priority ? (index != this.props.edIn ? (
      <TodoItem key={el.text + '' + index}
        el={el}
        index={index}
        setEdit={this.props.setEdit}
        remove={this.props.remove}
        boxClick={this.props.boxClick}
      />
    ) : (
        <EditTodo key={el.text + '' + index}
          el={el}
          index={index}
          save={this.props.save}
        />
      )) : null));
  }

  render() {
    return (
      <div className='col-sm-8'>
        <div className='panel panel-default'>
          <div className='panel-heading'>View Todos</div>
          <div className='panel-body'>
            {this.props.sortBox == true ?
              (<ul className='list-group'>
                {this.renderItems()}
              </ul>) :
              (<ul className='list-group'>
                {this.renderPriority(1)}
                {this.renderPriority(2)}
                {this.renderPriority(3)}
              </ul>)
            }
          </div>
          <Control
            sortBox={this.props.sortBox}
            update={this.props.update}
          />
        </div>
      </div >
    )
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      textIn: '',
      prioIn: '3',
      editIndex: -1,
      sort: true,
      todo: []
    };

    this.updateInput = this.updateInput.bind(this);
    this.updateCheckbox = this.updateCheckbox.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.setEditTodo = this.setEditTodo.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
    this.saveTodo = this.saveTodo.bind(this);
  }

  componentWillMount() {
    axios
      .get('/api/TodoItems/?$')
      .then(response => response.data)
      .then(todo => this.setState({ todo }));
  }

  updateInput(field, value) {
    this.setState({
      [field]: value
    });
  }

  updateCheckbox(index) {
    let toDoList = this.state.todo;

    let updatedTodo = { id: index, text: this.state.todo[index].text, priority: this.state.todo[index].priority, value: this.state.todo[index].value == false ? true : false }
    toDoList.splice(index, 1, updatedTodo);

    this.setState({
      todo: toDoList
    });

    axios.post('/api/TodoItems/?$', updatedTodo);
  }

  addTodo() {
    if (this.state.textIn == null || this.state.textIn == '') return alert('Error, Please add some text to your new to-do item.');
    //if (this.state.prioIn == null) return alert('Error, Please select a priority for your new to-do item.');

    let todoList = this.state.todo;

    let newTodo = {
      id: todoList.length,
      priority: this.state.prioIn,
      text: this.state.textIn,
      value: false
    }

    todoList.push(newTodo);

    //Add the new todo item and clear the input fields
    this.setState({
      textIn: '',
      prioIn: '3',
      todo: todoList
    });

    axios.post('/api/TodoItems/?$', newTodo);
  }

  setEditTodo(index) {
    this.setState({
      editIndex: index
    });
  }

  saveTodo(save, text, priority, value) {
    if (save) {
      let todoList = this.state.todo;

      let updatedTodo = { id: this.state.editIndex, text: text, priority: priority, value: value }
      todoList.splice(this.state.editIndex, 1, updatedTodo);

      this.setState({
        todo: todoList
      });
      axios.post('/api/TodoItems/?$', updatedTodo);
    }
    this.setState({
      editIndex: -1
    });
  }

  removeTodo(index) {
    let todoList = this.state.todo;

    todoList.splice(index, 1);

    todoList.forEach((element, index) => {
      element.id = index;
    });

    this.setState({
      todo: todoList
    });
    axios.delete(`/api/TodoItems/${index}`);
  }

  render() {
    return (
      <div className='container-fluid'>
        <div className='row' style={{ color: '#a74858' }}>
          <div className='col-sm-12'>
            <h1>Very Simple Todo App</h1>
            <h4>Track all the things</h4>
          </div>
        </div>
        <div className='panel'></div>
        <div className='row'>
          <Input
            text={this.state.textIn}
            prio={this.state.prioIn}
            add={this.addTodo}
            update={this.updateInput}
          />
          <Output
            todo={this.state.todo}
            setEdit={this.setEditTodo}
            edIn={this.state.editIndex}
            save={this.saveTodo}
            remove={this.removeTodo}
            boxClick={this.updateCheckbox}
            sortBox={this.state.sort}
            update={this.updateInput}
          />
        </div>
      </div>
    );
  }
}

export default App;


/* UI Wireframe:
 --> app component, will hold state
  -Container
    -div row
      -Header: Very Simple Todo App
      -Header 2: Track all the things
    -div panel (separator line)
    -div row
      -Panel 4 cols --> Input component, gets add todo function as prop and update input as prop
        -Panel head:Add new Todo
        -Panel body:Input fields
        -Panel footer: Add button
      -Panel 8 cols  --> Todo component, gets state todo array as prop, edit todo function as prop, and remove todo function as prop
        -Panel head:View Todos
        -Panel body
          -List
            -Todo item
              -input value tied to todo text state, invisible until edit button is pressed
              -select, value tied to todo priority state, invisible until edit button is pressed
              -Edit button --> causes Todo item to expand with input field containing todo text and priority drop down
              -Delete button
*/
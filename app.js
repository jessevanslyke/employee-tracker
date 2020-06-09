var mysql = require("mysql");
var inquirer = require("inquirer");

var PORT = process.env.PORT || 8088;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot",
    database: "employeeDB"
});

connection.connect(function(err) {
    if (err) {
      console.log("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);

    menu();
});

function menu() {
  inquirer
  .prompt({
    name: "query",
    type: "list",
    message: "What would you like to do?",
    choices: ["View All Employees",
  "View All Employees By Department",
  "View All Employees By Manager",
  "Add Employee",
  "Remove Employee",
  "Update Employee Role",
  "Update Employee Manager",
  "View All Roles",
  "Add New Role",
  "Remove Role",
  "View All Departments",
  "Add New Department",
  "Quit"]
  })
  .then(function(answer) {
    switch(answer.query) {
      case "View All Employees":
        selectAllEmployees();
        break;
      case "View All Employees By Department":
        selectAllEmpByDept();
        break;
      case "View All Employees By Manager":
        selectAllEmpByMgr();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Remove Employee":
        removeEmployee();
        break;
      case "Update Employee Role":
        updateEmployeeRole();
        break;
      case "Update Employee Manager":
        updateEmployeeManager();
        break;
      case "View All Roles":
        selectAllRoles();
        break;
      case "Add New Role":
        addNewRole();
        break;
      case "Remove Role":
        removeRole();
        break;
      case "View All Departments":
        selectAllDepartments();
        break;
      case "Add New Department":
        addNewDepartment();
        break;
      case "Quit":
      default:
        console.log("Goodbye!");
        connection.end();
        break;
    }
  })
}

function selectAllEmployees() {
  connection.query("SELECT * FROM employee", function(err, res) {
    if(err)
      throw err;

    console.table(res);
    menu();
  });
}

function selectAllEmpByDept() {
  connection.query("SELECT * FROM department", function(err, res) {
    if (err)
      throw err;
    
      inquirer
      .prompt({
        name: "department_id",
        type: "rawlist",
        message: "Which department ID do you want to select on?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            choiceArray.push(res[i].id)
          }
          return choiceArray;
        }
      })
      .then(function(answer) {

      connection.query(`SELECT e.id AS "Employee ID", 
      e.first_name AS "Employee First Name",
      e.last_name AS "Employee Last Name",
      d.id AS "Department ID",
      d.name AS "Department Name"  
      FROM employee e 
      INNER JOIN role r 
      ON r.id = e.role_id 
      INNER JOIN department d 
      ON d.id = r.department_id
      WHERE ?;`, [answer], function(err, res) {
        if(err)
          throw err;
    
        console.table(res);
        menu();
      });  
    });
  });
};

function selectAllEmpByMgr() {
  connection.query("SELECT * FROM employee", function(err, res) {
    if (err)
      throw err;
    
      inquirer
      .prompt({
        name: "manager_id",
        type: "rawlist",
        message: "Which manager ID do you want to select on?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].manager_id !== null && !isNaN(res[i].manager_id)) {
            choiceArray.push(res[i].manager_id)
            }
          }
          return choiceArray;
        }
      })
      .then(function(answer) {
        connection.query(`SELECT e.id AS "Employee ID", 
      e.first_name AS "Employee First Name",
      e.last_name AS "Employee Last Name",
      r.title AS "Role/Title",
      d.name AS "Department Name",
      m.first_name AS "Manager First Name"
      FROM employee e 
      INNER JOIN role r 
      ON r.id = e.role_id 
      INNER JOIN department d 
      ON d.id = r.department_id
      INNER JOIN employee m
      ON m.id = e.manager_id
      WHERE m.id = ?;`, [answer.manager_id], function(err, res) {
        if(err)
          throw err;
    
        console.table(res);
        menu();
      });  
    });
  });
};

function selectAllDepartments() {
  connection.query("SELECT * FROM department", function(err, res) {
    if(err)
      throw err;

    console.table(res);
    menu();
  });
}

function selectAllRoles() {
  connection.query("SELECT * FROM role", function(err, res) {
    if(err)
      throw err;

    console.table(res);
    menu();
  });
}

function addNewDepartment() {
  inquirer
  .prompt({
    name: "department",
    type: "input",
    message: "Type a new department name to create a new department: "
  })
  .then(function(answer) {

    connection.query(`INSERT INTO department (name) VALUES (?)`, [answer.department], function(err) {
      if (err)
        throw err;
      
      console.log("New department name: " + answer.department + "\n\nInsert succeeded!");
      menu();
    })
  })
}

function addNewRole() {
  let choiceArray = [];

  connection.query("SELECT * FROM department", function(err, res) {
    inquirer
    .prompt([ 
      {
        name: "role",
        type: "input",
        message: "Type a new role name to create a new role: "
      },
      {
        name: "salary",
        type: "input",
        message: "Enter a salary for this new role: "
      },
      {
        name: "department_id",
        type: "rawlist",
        message: "Which department ID do you want to add the new role to?",
        choices: function() {
          for (var i = 0; i < res.length; i++) {
            if (res[i].id !== null && !isNaN(res[i].id)) {
            choiceArray.push(res[i].id)
            }
          }
          return choiceArray;
        }
      }
    ])
    .then(function(answer) {

      connection.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answer.role, answer.salary, answer.department_id], function(err) {
        if (err)
          throw err;
        
        console.log("New role name: " + answer.role +  "\nNew Salary for role: " + answer.salary + "\nRole belongs to departmentID: " + answer.department_id + "\n\nInsert succeeded!");
        menu();
      })
    })
  })
}

function removeRole() {
  connection.query("SELECT * FROM role", function(err, res) {
    inquirer
    .prompt({
      name: "title",
      type: "rawlist",
      message: "Which role do you wish to remove?",
      choices: function() {
        const choiceArray = [];
        for (var i = 0; i < res.length; i++) {
          if (res[i].title !== null) {
          choiceArray.push(res[i].title)
          }
        }
        return choiceArray;
      }
    })
    .then(function(answer) {

      connection.query(`DELETE FROM role WHERE ?`, [answer], function(err) {
        if (err)
          throw err;
        
        console.log("Role has succeesfully been deleted!");
        menu();
      })
    })
  })
}

function addEmployee() {
  connection.query("SELECT * FROM role", function(err, res) {
    inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the new Employee's first name?"
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the new Employee's last name?"
      },
      {
        name: "role_id",
        type: "rawlist",
        message: "Which role do you wish to assign the new Employee to?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].id !== null) {
            choiceArray.push(res[i].id)
            }
          }
          return choiceArray;
        }
      }
    ])
    .then(function(answer) {
      connection.query(`INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)`, [answer.firstName, answer.lastName, answer.role_id], function(err) {
        if (err)
          throw err;
        
        console.log("Employee has been added successfully!");
        menu();
      })
    })
  })
}

function removeEmployee() {
  connection.query("SELECT * FROM employee", function(err, res) {
    inquirer
    .prompt({
      name: "first_name",
      type: "rawlist",
      message: "Which employee do you wish to remove?",
      choices: function() {
        const choiceArray = [];
        for (var i = 0; i < res.length; i++) {
          if (res[i].first_name !== null) {
          choiceArray.push(res[i].first_name)
          }
        }
        return choiceArray;
      }
    })
    .then(function(answer) {

      connection.query(`DELETE FROM employee WHERE ?`, [answer], function(err) {
        if (err)
          throw err;
        
        console.log("Employee has succeesfully been deleted!");
        menu();
      })
    })
  })
}

function updateEmployeeRole() {
  connection.query("SELECT * FROM role", function(err, res) {
    inquirer
    .prompt([
      {
        name: "title",
        type: "rawlist",
        message: "Which role do you wish to update?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].title !== null) {
            choiceArray.push(res[i].title)
            }
          }
          return choiceArray;
        }
      },
      {
        name: "newRole",
        type: "input",
        message: "What would you like to call this role now?"
      }
    ])
    .then(function(answer) {

      connection.query(`UPDATE role SET title = ? WHERE title = ?`, [answer.newRole,answer.title], function(err) {
        if (err)
          throw err;
        
        console.log("Role name has succeesfully been modified!");
        menu();
      })
    })
  })
}

function updateEmployeeManager() {
  connection.query("SELECT * FROM employee", function(err, res) {
    inquirer
    .prompt([
      {
        name: "employee_id",
        type: "rawlist",
        message: "Which employee do you wish to update?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].id !== null) {
            choiceArray.push(res[i].id)
            }
          }
          return choiceArray;
        }
      },
      {
        name: "manager_id",
        type: "rawlist",
        message: "What manager do you wish to assign this new employee to?",
        choices: function() {
          const choiceArray = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].id !== null) {
            choiceArray.push(res[i].id)
            }
          }
          return choiceArray;
        }
      }
    ])
    .then(function(answer) {

      connection.query(`UPDATE employee SET manager_id = ? WHERE id = ?`, [answer.manager_id,answer.employee_id], function(err) {
        if (err)
          throw err;
        
        console.log("Role name has succeesfully been modified!");
        menu();
      })
    })
  })
}
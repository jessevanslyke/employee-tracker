USE employeeDB;

INSERT INTO department (name)
VALUES ("IT");

INSERT INTO role (title, salary, department_id)
VALUES ("Chief Technology Officer", 208000, 1000);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Jesse", "VanSlyke", 100);

INSERT INTO role (title, salary, department_id)
VALUES("SVP, Technology", 150000, 1000);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES("Kyle", "Swelad", 101, 1);
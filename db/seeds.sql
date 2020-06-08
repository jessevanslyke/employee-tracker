USE employeeDB;

INSERT INTO department (id, name)
VALUES (1000, "IT");

INSERT INTO role (id, title, salary, department_id)
VALUES (100, "Chief Technology Officer", 208000.00, 1000);

INSERT INTO employee (id, first_name, last_name, role_id)
VALUES (1, "Jesse", "VanSlyke", 100);
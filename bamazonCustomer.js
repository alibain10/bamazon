var mysql = require("mysql");
var ctable = require("console.table");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

//show all productrs
function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.table(results);
        productID();

    });
}


function productID() {
    inquirer
        .prompt({
            name: "productID",
            type: "iput",
            message: "What is the ID of the product you would like to buy",
            validate: function (value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        },
            {
                name: "units",
                type: "input",
                message: "How many units would like to buy?",
                validate: function (value) {
                    if (isNaN(value) == false) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },

    )
    .then(function(answer) {
    connection.query("SELECT id, product_name, stock_quantity, price FROM products WHERE ?", { id: answer.productID }, function(err, results) {
        if (err) throw err;
        if (results[0].stock_quantity >= answer.units) {
            var itemsRemaining = results[0].stock_quantity - answer.units;
            var purchaseTotal = answer.units * results[0].price;
            connection.query(`UPDATE products SET stock_quantity=${itemsRemaining} WHERE id=${answer.productID}`, function(err, results) {
                if (err) throw err;
                console.log(`Your total is: ${purchaseTotal}`);
                continueShopping();
            });
        } 
        else {
            console.log("Quantity requested exceeds available inventory for this product.");
            continueShopping();
        }
    })
})

function continueShopping () {
    inquirer.prompt([
        {
            name: "tryAgain",
            type: "confirm",
            message: "Would you like to continue shopping? "
        }
    ]).then(function (answer) {
        if (answer.tryAgain) {
            start();
        } else {
            connection.query("SELECT * FROM products", function(err, results) {
                if (err) throw err;
                console.table(results);
            });
            console.log("Thank you for shopping!");
        }
    })
}
   /* .then(function(answer) {
        // get the information of the chosen item
       var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.productID) {
            chosenItem = results[i];
          }
        }

        // determine if there was enough stock
        if (chosenItem.stock_quantity < parseInt(answer.units)) {
          
          console.log("I'm sorry there is not enough inventory.");
          start();
        }
        else {
          // bid wasn't high enough, so apologize and start over
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: answer.units - stock_quantity
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Order not successful!");
              start();
            }
          );
          start();
        }
      });*/

}

/*
    Bill Object
        This object represents a single bill that the user owes every month.
        Parameters:
            amount - the amount of the bill, a float
            dueDate - the day of the month the bill is due, an integer
            name - the name of the bill, a string
*/
function bill(amount, dueDate, name) {
    this.amount = amount;
    this.dueDate = dueDate;
    this.name = name;
    /*
         nextDueDate(date) determines when the next due date of a bill is, given any date.
         It returns the next due date, in the format of a date object.
    */
    this.nextDueDate = function (date) {
        // First, we initialize the nextDue variable,
        // eliminating the time stamp, keeping only YYYY-MM-DD (No HH:MM:SS)
        var nextDue = new Date(date.getFullYear(), date.getMonth(), this.dueDate);
        // if it's already happened this month, 
        if (date > nextDue) {
            // set it to next month's due date
            nextDue.setMonth(date.getMonth() + 1);
        }
        return nextDue;
    }
}

/*
    Expenses Object
        This object represents all of the user's expenses.
        It keeps track of bills and user-entered transactions in separate arrays.
*/
function expenses() {
    // We keep all our bills in an array.
    this.bills = Array();
    // Add a new bill into our expenses array
    this.add = function (bill) {
        this.bills.push(bill);
    }
    // Any user-added transactions are kept in this array.
    this.transactions = Array();
    // Remember whether we have started adding transactions or not
    this.transactionsAdded = false;
    // Add a new user-added transaction, based on the index of the row in the table
    this.addTransaction = function(amount, index) {
        this.transactions[index] = amount;
    }
    /*
        dueToday(date, index) determines the total amount due on a given date.
        Parameters:
            date - the current date being iterated over, in the form of a date object
            index - the index of the current row in the table, an integer
    */
    this.dueToday = function (date, index) {
        // Initialize a variable to keep track of the total
        var total = 0;
        // Loop through the array of bills
        for (var i = 0; i < this.bills.length; i++) {
            // if there is a bill on this date, add it to the total
            if (this.bills[i].nextDueDate(date).getTime() == date.getTime()) {
                total += this.bills[i].amount;
            }
            
        }
        // If there is a value in the transactions array at this index
        if ((this.transactions[index] != "") && !isNaN(this.transactions[index])) {
            // add that value to the total
            total += this.transactions[index];
        }
        // return the total due on a given date
        return total;
    }
    /*
        whichDue(date) specifically formats which bills are due and how much on a given date.
        It returns a string of HTML to be printed in the bill cell of the current row.
            Parameters:
            date - the current date being iterated over, in the form of a date object
    */
    this.whichDue = function (date) {
        // Initialize a variable to store this information as HTML
        var HTML = "";
        // Loop through the array of bills
        for (var i = 0; i < this.bills.length; i++) {
            // if there is a bill on this date, print the info
            if (this.bills[i].nextDueDate(date).getTime() == date.getTime()) {
                HTML += this.bills[i].name + ": $" + this.bills[i].amount + "<br>";
            }
        }
        // if nothing found, just return $0
        if (HTML == "") {
            HTML = "$0";
        }
        return HTML;
    }
}

/*
    Funds Object
        This object represents the money currently available to the user.
        Parameters: 
            balance - the user's current cash balance, a float
            payCheck - the amount of your paycheck, a float
            payDay - the date of your most recent paycheck, a date object
            f - the frequency with with the user gets paid
                It is either 7 (weekly), 14 (biweekly), or 0 (monthly)
            m - optional, day of the week on which you get paid
                (only if paid monthly) an integer ranging from 0-6
            n - optional, the week on which you get paid
                (only if paid monthly) an integer ranging from 0-4
            ** For example: if you are paid every 4th Friday of the month, n = 4 and m = 5
*/
function funds(balance, payCheck, payDay, frequency) {
    this.balance = balance;
    this.payCheck = payCheck;
    this.payDay = payDay;
    // frequency of paycheck
    this.frequency = frequency;
    // the week on which you get paid
    this.n = Math.ceil(payDay.getDate()/7);

    /* 
        isPayDay(date) determines if a given date object is pay day.
        It returns a boolean.
    */
    this.isPayDay = function (date) {
        // if f is 0, the user is paid monthly
        if (frequency == 0) {
            // if you have already been paid this month
            if (this.payDay.getMonth() == date.getMonth()) {
                // you will not be paid today
                return false;
            }
            // if you have not been paid this month
            else {
                // determine if it is the same day of the week as payday
                if (this.payDay.getDay() == date.getDay()) {
                    // Determine if it is the nth week of the month
                    if (date.getDate()/7 <= this.n && date.getDate()/7 > (this.n - 1)) {
                        // If yes, today is payday!
                        return true;
                    }
                    // Otherwise it isn't
                    else return false;
                }
                // otherwise, it's not payday
                else return false;
            }
        }
        // otherwise, check if a multiple of the frequency
        // has passed since the last pay check
        else {
            // measure time in days between last pay check and given date
            /* (to get time in days, convert to milliseconds, 
                then divide by hours * minutes * seconds * milliseconds)
            */
            var difference = Math.abs((date.getTime() - this.payDay.getTime())/(24*60*60*1000));
            if (difference % this.frequency == 0) {
                return true;
            }
        }
        return false;
    }

    /* 
        available(date,expenses,index) calculates the funds available on a particular date.
            Parameters:
            date - the current date being iterated over, in the form of a date object
            expenses - the user's expenses, an expenses object
            index - the index of the current row in the table, an integer
    */
    this.available = function (date, expenses, index) {
        // create a new date object with the given date
        var d = new Date(date);
        // If it's payday, add the paycheck to the balance
        if (this.isPayDay(date)) {
            this.balance += this.payCheck;
        }
        // if it's a due date for a bill,
        // or the user entered a transaction on this date,
        // subtract it from the balance
        this.balance -= expenses.dueToday(date, index);
        return this.balance;
    }
    /*
        payToday(date) returns the amount of the payCheck on any given date
    */
    this.payToday = function (date) {
        // create a new date object
        var d = new Date(date);
        // if it's payday, return the amount
        if (this.isPayDay(date)) {
            return this.payCheck;
        }
        // otherwise, return 0
        else return 0;
    }
}

/*
    Buddy Sheet Object
*/
function buddySheet(targetDate, funds, expenses) {
    // Select our table
    var table = document.getElementById("table");
    // Initialize a date object with today's date
    var t = new Date();
    // Create a date object for comparison, eliminating
    // the time stamp, keeping format YYYY-MM-DD
    var dateCounter = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    // keep count of the number of rows, starting at 0
    var rowIndex = 0;
    // remember the original balance
    var originalBalance = funds.balance;
    // Create a new row in the table for each day as we count
    // until the targetDate is reached
    while (dateCounter <= targetDate) {
        // create a new row
        var row = table.insertRow(table.rows.length);
        // add a date cell
        var dateCell = row.insertCell(0);
        dateCell.className = "date_column";
        // add a balance cell
        var balanceCell = row.insertCell(1);
        balanceCell.className = "balance_column";
        // add a bill cell
        var billCell = row.insertCell(2);
        billCell.className = "bill_column";
        // add a paycheck cell
        var payCell = row.insertCell(3);
        payCell.className = "pay_column";
        // add a transaction cell
        var transactionCell = row.insertCell(4);
        transactionCell.className = "transaction_column";
        // The Date column displays the date
        dateCell.innerHTML = dateFormat(dateCounter);
        // The Balance column displays the balance on that date, to 2 decimal places
        var currentBalance = (funds.available(dateCounter, expenses, rowIndex)).toFixed(2)
        balanceCell.innerHTML = "$" + currentBalance;
        // If the balance is negative, color code it red
        if (currentBalance < 0) {
            balanceCell.className = "negative_balance";
        }
        // The Bills column displays the name and total amount of bills due
        billCell.innerHTML = expenses.whichDue(dateCounter);
        // If a bill is due today, highlight this cell
        if (expenses.dueToday(dateCounter) > 0) {
            billCell.className = "bill_due";
        }
        // The Paycheck cell displays any pay received on that date
        payCell.innerHTML = "$" + funds.payToday(dateCounter);
        // If today is payday, highlight this row
        if (funds.payToday(dateCounter) > 0) {
            row.className="payday_row";
        }
        // The Transaction cell lets the user enter transactions
        // create a new text input
        var input = document.createElement("input");
        input.type = "text";
        // set its class
        input.className = "transaction_input";
        // If we have not yet added any transactions, we will initialize 
        // the expenses.transactions array with all zeroes
        if (!expenses.transactionsAdded) {
            expenses.addTransaction(0, rowIndex);
        }
        // If transactions HAVE been added already
        else {
            // If there is a transaction in this row of the table
            if (expenses.transactions[rowIndex] > 0) {
                // Color code this cell
                transactionCell.className = "transaction_entered";
            }
        }
        // Set the placeholder for this input to reflect this row in the expenses.transactions array
        input.setAttribute("placeholder", ("$" + expenses.transactions[rowIndex]));
        // set the row index in this input element's dataset
        input.dataset.rowIndex = rowIndex;
        // put the input into the transactionCell of our table
        transactionCell.appendChild(input);
        // Attach an event listener to the transaction input
        input.addEventListener("keyup", function(event) {
            // when the user hits "Enter" or "Return"
            if (event.keyCode == 13) {
                // If the user entered a value that is a number and is not blank
                if (!isNaN(this.value) && this.value != "") {
                    // Add a new transaction to our expenses
                    expenses.addTransaction(parseFloat(this.value), this.dataset.rowIndex);
                    // remember that we have added transactions, so that
                    // when we rewrite the Buddy Sheet, it doesn't write over the
                    // transactions array again
                    expenses.transactionsAdded = true;
                    // reset our funds to the original balance
                    funds.balance = originalBalance;
                    // clear the table
                    $("#table").find("tr:gt(0)").remove();
                    // rewrite it using this transaction
                    buddySheet(targetDate, funds, expenses);
                }
            } 
        });
        // increment to the next row
        rowIndex++;
        // increment to the next day
        dateCounter.setDate(dateCounter.getDate() + 1);
    }
}

/*
    Formats the date to Day Of The Week, MM/DD/YYYY.
*/
function dateFormat(date) {
    var week = Array(
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
    var month = Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    return month[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear() + ": " + week[date.getDay()];
}

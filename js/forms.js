 window.onload = function() {
    // Reload the page
    $("#refresh").click(function () {
        location.reload();
    });
    /*
     *    Generates input fields for a bill's name, 
     *    amount, and due date. We keep a count of how many
     *    times the button has been clicked, so each bill
     *    has the proper id and name.
     */
    // this global variable, i, keeps count of how many bills are added
    var i = 0;
    $('#createBill').click(function () {
        // Title of the bill
        $('.bills').append('<h4>Bill #' + (i + 1) + '</h4>');
        // Name of the bill
        $('.bills').append('<label name="billName' + i + '">Name</label><input type="text" name="billName' + i + '" id="billName' + i + '" size="8" required>');
        // Amount of the bill
        $('.bills').append('<br><label name="billAmount' + i + '">Amount $</label><input type="text" name="billAmount' + i + '" id="billAmount' + i + '" size="8" required> <span class="message" id="billAmountMessage' + i + '"></span>');
        // Due date of the bill
        $('.bills').append('<br><label name="billDueDate' + i + '">Day of the Month Due</label>');
        // Drop down menu for day of the month of due date
        var select = ' <select name="billDueDate' + i + '" id="billDueDate' + i + '" required>';
        for (var j = 1; j <= 28; j++) {
            select += '<option value="' + j + '">' + j + '</option>';
        }
        select += '</select>';
        $('.bills').append(select);
        $('.bills').append('<hr>');
        // increment the count of bills added
        i++;
    });

    /*
     *    Generates a jQuery UI datepicker so the user
     *    can input the date of their last paycheck.
     *    The date must be within the past month.
     */
    $(function () {
        $("#payDay").datepicker({
            minDate: "-1M",
            maxDate: 0
        });
    });

    /*
     *    Generates a jQuery UI datepicker for the
     *    targetDate for Budget Buddy to forecast.
     *    The targetDate must be at least 7 days ahead
     *     and no more than 2 months ahead.
     */
    $(function () {
        $("#targetDate").datepicker({
            minDate: 7,
            maxDate: "+2M"
        });
    });

    /*
    *    This function validates the dollar amount from 
    *    a text input field on focusout. We want:
    *    A) The user to complete this field.
    *    B) The user to input a number.
    *    C) A number with no more than two decimal places
    */
    function validateDollarAmount(inputId, messageId, e) {
        // The message to be displayed for invalid input.
        var message = "Please provide a positive number formatted to 2 or fewer (optional) decimal places.";
        // A regular expression for a number with an optional
        // two decimal places, but no more than two
        var reg = /^\d+\.?\d{0,2}$/;
        if (!reg.test($(inputId).val())) {
            $(messageId).html(message);
            return false;
        }
        // if the input is valid, no message
        else {
            $(messageId).html("");
            return true;
        }
    }

    /*
    *    This function validates the input
    *    from a datepicker, given a range.
    */
    function validateDatepicker(inputId, messageId, min, max) {
        // message to be displayed upon invalid input
        var message = "Please provide a valid date.";
        // Verify the date picked is a real date.
        var d = new Date($(inputId).val());
        if (isNaN(d.getTime())) {
            $(messageId).html(message);
            return false;
        }
        // Verify the range
        else if (d.getTime() > max.getTime() || d.getTime() < min.getTime()) {
            $(messageId).html(message);
            return false;
        }
        // If the date is valid, no message
        else {
            $(messageId).html("");
            return true;
        }
    }

    /*
     *    The build button extracts the values from 
     *    the entire form and generates our Budget Buddy table
     *    accordingly. It also validates the input,
     *    and generates approprate error messages.
     */
    $('#submit').click(function (e) {
        // Prevent it from actually trying to POST or GET any data.
        e.preventDefault();
        
        // Boolean to determine whether the entire form is valid or not.
        var valid = false;

        // Validate the balance field.
        var validBalance = validateDollarAmount("#balance", "#balanceMessage");
        // Set the user's current balance
        var balance = parseFloat($("#balance").val());
        
        // Validate the payCheck field.
        var validPayCheck = validateDollarAmount("#payCheck", "#payCheckMessage");
        // Set the user's paycheck amount.
        var payCheck = parseFloat($("#payCheck").val());
        
        /* Validate the date of the last paycheck.
        *  It should be no later than today, and no
        *  earlier than a month ago. */
        var minPD = new Date();
        var maxPD = new Date();
        minPD.setDate(maxPD.getDate() - 32);
        var validPayDay = validateDatepicker("#payDay", "#payDayMessage", minPD, maxPD);
        // Set the user's paycheck amount.
        var payDay = new Date($("#payDay").val());

        // Set the frequency of the user's paycheck.
        var f = $("input:radio[name=f]:checked").val();

        // Validate the frequency
        var validFrequency = false;
        // If valid, no message
        if (f) {
            validFrequency = true;
            $("#fMessage").html("");
        }
        // if no f, display message
        else {
            $("#fMessage").html("Please select a frequency.");
        }

        // Create a new funds object.
        // If the frequency is weekly or biweekly
        if (validFrequency) {
            var fundsObject = new funds(balance, payCheck, payDay, f);
        }
        
        /* Validate the target date.
        *  It should be no later than two months away,
        *  no earlier than a week from today. */
        var minTD = new Date();
        var maxTD = new Date();
        minTD.setDate(minTD.getDate() + 6);
        maxTD.setMonth(maxTD.getMonth() + 2);
        var validTargetDate = validateDatepicker("#targetDate", "#targetDateMessage", minTD, maxTD);
        // Set the user's targetDate
        var targetDate = new Date($("#targetDate").val());
        
        // Create a new expenses object.
        var expensesObject = new expenses();

        // Validate the funds section of the form
        valid = (validTargetDate && validPayDay && validFrequency && validPayCheck && validBalance);

        // If the user has added bills
        if (i > 0) {
            // Keep count of how many are valid
            var validBills = 0;
            // Find the values for each bill.
            for (var k = 0; k < i; k++) {
                var billName = "#billName" + k;
                var name = $(billName).val();
                var billAmount = "#billAmount" + k;
                var amount = parseFloat($(billAmount).val());
                var billDueDate = "#billDueDate" + k;
                var dueDate = $(billDueDate).val();
                // Validate the bill amount input.
                var validBill = validateDollarAmount(billAmount, ("#billAmountMessage" + k));
                // if valid, create a new bill object
                if (validBill) {
                    var billObject = new bill(amount, dueDate, name);
                    // push it to our expenses
                    expensesObject.add(billObject);
                    validBills++;
                }
            }
            // If all of the bills are not valid, our entire form is invalid
            if (validBills != i) valid = false;
        }

        // If everything is valid
        if (valid) {
            // hide the Form
            $("#form").attr("class", "row hidden");
            // Show the 50/20/30 advice
            $("#advice").attr("class", "row");
            // Add the advice specific to this user
            fiftyThirtyTwenty(payCheck, f);
            // show the Buddy Sheet table
            $("#buddySheet").attr("class", "row");
            buddySheet(targetDate, fundsObject, expensesObject);
        }
    });

    /*
    *    Recommends a target monthly budget
    *    based on the user's input.
    */
    function fiftyThirtyTwenty (paycheck, f) {
        // Calculate the total monthly income.
        var text = "";
        var total = 0;
        if (f > 0) {
            total = paycheck * (28/f);
        }
        else total = paycheck;
        
        // Fill in the recommendation.
        $("#fifty").append(parseInt(total*.5));
        $("#thirty").append(parseInt(total*.3));
        $("#twenty").append(parseInt(total*.2));
    }
}
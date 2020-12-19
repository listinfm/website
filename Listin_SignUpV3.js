    //Variables
    var uid = String();
    var accountInfoSuccessMessage = document.getElementById('accountInformationSuccessMessage');
    var resetEmailSuccessMessage = document.getElementById('resetEmailSuccessMessage');
    var resetEmailErrorMessage = document.getElementById('resetEmailErrorMessage');

    resetEmailErrorMessage.style.display = 'none';
    resetEmailSuccessMessage.style.display = "none";
    accountInfoSuccessMessage.style.display = "none";
    
    /// Event Listeners ///////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////////////////////
    document.getElementById('profileAccountInfoUpdateButton').addEventListener('click', updateProfileAccountInformation);
    
    /////////////////////////////////////////////////////////////////////
    //Update Email
    document.getElementById('profileResetEmailButton').addEventListener('click', function()
    {
        var resetEmail = document.getElementById('resetEmail').value;
        var repeatResetEmail = document.getElementById('repeatResetEmail').value;
        var  psw = String(document.getElementById('updateEmailPassword').value);
        resetEmailErrorMessage.style.display = 'none';
        resetEmailSuccessMessage.style.display = "none";

        if (resetEmail == repeatResetEmail)
        {
            var user = firebase.auth().currentUser;
            var credential = firebase.auth.EmailAuthProvider.credential
            (
                user.email,
                psw
            )   

            user.reauthenticateWithCredential(credential).then(function() 
            {
                // User re-authenticated.
                user.updateEmail(resetEmail).then(function() 
                {
                    // Update successful.
                    profileResetEmailButton.innerText = "Updating";
                    resetEmailSuccessMessage.style.display = "block";
                    resetEmailSuccessMessage.innerText = "Updating email, you will be signed out soon. Please sign in with new credentials.";

                    firebase.database().ref('/users/' + uid).update
                    ({
                        uid: uid,
                        email: user.email
                    })
                    .then(function()
                    {
                        resetEmailSuccessMessage.innerText = "Email updated";
                        setTimeout(function(){userSignout()}, 2500);
                        setTimeout(function(){window.location.replace('/sign-in')}, 3500);
                    })
                    .catch(function(error)
                    {
                        console.log("Whoops, something went wrong.. error: " + error);
                        resetEmailErrorMessage = errorMessage
                    })
                })
                .catch(function(error) 
                {
                    // An error happened.
                    console.log('error code: ' + errorCode);
                    console.log('error message: ' + errorMessage);
                    resetEmailErrorMessage.innerText = errorMessage;
                    resetEmailErrorMessage.style.display = 'block';

                });
            })
            .catch(function(error) 
            {
                // An error happened.
                resetEmailErrorMessage.innerText = "Either this email is already in use or your password does not match, please verify both and retry.";
                resetEmailErrorMessage.style.display = 'block';
            });
            
        }
        else
        {
            resetEmailErrorMessage.innerText = "Emails don't match!";
            resetEmailErrorMessage.style.display = "block";
            profileResetEmailButton.innerText = "Update Email";

        }
    });


    /////////////////////////////////////////////////////////////////////
    //Update password
    document.getElementById('profilePasswordResetButton').addEventListener('click',function ()
    {

      var emailAddress = String(document.getElementById('currentEmail').value);
      resetPasswordErrorMessage.style.display = 'none';
      resetSuccessErrorMessage.style.display = 'none';

      firebase.auth().sendPasswordResetEmail(emailAddress)
      .then(function() 
      {
        //emailAddress
        resetSuccessErrorMessage.style.display = "block"
        setTimeout(function(){userSignout()}, 4500);
        setTimeout(function(){window.location.replace('/sign-in');}, 5000);
      })
      .catch(function(error)
      {
        console.log('error code: ' + error.code);
        console.log('error message: ' + error.message);
        restPasswordErrorMessage.innerText = error.message;
        restPasswordErrorMessage.style.display = 'block';
        profilePasswordResetButton.innerText = String('Submit');
      });
    });

    /////////////////////////////////////////////////////////////////////
    //Run initApp() function as soon as the page loads
    window.addEventListener('load', function()
    {

        initApp()

    });

    /////////////////////////////////////////////////////////////////////
    //Sets all the inputs on the profile page
    initApp = function()
    {
        firebase.auth().onAuthStateChanged(function (user)
        {
            if (user)
            {
                //Get the authenticated user's email address
                if (user.email == null)
                {
                    var email = "";
                }
                else
                {
                    var email = user.email;
                    getUserUID();
                }

                getFirebaseUserAccountInfo();
            }
        })
    }


    /////////////////////////////////////////////////////////////////////
    const getFirebaseUserAccountInfo = () =>
    {
        var dobMonthDict = {Jan : 1,
                        Feb : 2,
                        Mar : 3,
                        Apr : 4,
                        May : 5,
                        Jun : 6,
                        Jul : 7,
                        Aug : 8,
                        Sep : 9,
                        Oct : 10,
                        Nov: 11,
                        Dec : 12};

        //Email
        firebase.database().ref('/users/' + uid).once('value').then((snapshot) =>
        {
            var dobArray = snapshot.val().dob.split(" ");
            var user = firebase.auth().currentUser;

            if (user.email != snapshot.val().email)
            {
                firebase.database().ref('/users/' + uid).update
                ({
                    uid: uid,
                    email: user.email
                })
                document.getElementById('currentEmail').value = user.email;
            }
            else
            {
                document.getElementById('currentEmail').value = snapshot.val().email;
            }
            document.getElementById('currentEmail').disabled = true;
            document.getElementById('currentEmail').style.backgroundColor = "#20222b";

            //Account Info
            document.getElementById('profileFirstName').value = snapshot.val().firstName;
            document.getElementById('profileLastName').value = snapshot.val().lastName;
            document.getElementById('dobDay').value = Number(dobArray[0]);
            document.getElementById('dobMonth').options[dobMonthDict[dobArray[1]]].selected = true;
            document.getElementById('dobYear').value = Number(dobArray[2]);

            //Subscription Plan
            console.log(elementID('profileNotificationCheckbox').value);
            console.log(elementID('profileNotificationCheckbox').checked);
            console.log(elementID('profileNotificationCheckbox'));
            elementID('profileNotificationCheckbox').checked = true;//snapshot.val().notificationSettings;
            //Notifications
        });
    }

    const elementID = (StringID) =>
    {
        return document.getElementById(StringID);
    }


    /////////////////////////////////////////////////////////////////////
    //Update account information                
    function updateProfileAccountInformation()
    {
        var firstName = document.getElementById('profileFirstName').value;
        var lastName = document.getElementById('profileLastName').value;
        var dobDay = document.getElementById('dobDay').value;
        var dobMonth = document.getElementById('dobMonth').value;
        var dobYear = document.getElementById('dobYear').value;
        var updatedDOBMonthDict = {1 : "Jan",
                                    2 : "Feb",
                                    3 : "Mar",
                                    4 : "Apr",
                                    5 : "May",
                                    6 : "Jun",
                                    7 : "Jul",
                                    8 : "Aug",
                                    9 : "Sep",
                                    10 : "Oct",
                                    11 : "Nov",
                                    12 : "Dec"};

        var formattedDOB = String(String(dobDay) + " " + String(updatedDOBMonthDict[Number(dobMonth)]) + " "  + String(dobYear))

        firebase.database().ref('/users/' + uid).update
        ({

            uid: uid,
            firstName: firstName,
            lastName: lastName,
            dob: formattedDOB
        })
        .then(function()
        {
            console.log("Success! Profile updated.");
            accountInfoSuccessMessage.style.display = "block";

            setTimeout(function(){accountInfoSuccessMessage.style.display = "hide"}, 5000);

        })
        .catch(function(error)
        {
            console.log("Whoops, something went wrong.. error: " + error);
            accountInfoSuccessMessage.value = "Something does not add up, please verify information before sending."
            accountInfoSuccessMessage.style.display = "block";
        })
    }
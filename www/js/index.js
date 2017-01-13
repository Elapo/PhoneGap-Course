/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


//phonegap plugins list | awk '{print $1}' | xargs phonegap plugins rm --save
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.connectionType = navigator.connection.type;
        console.log(this.connectionType);
        this.formData = {};
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('resume', onResume, false);
        document.addEventListener('volumedownbutton', onVolume, false);
        document.addEventListener('volumeupbutton', onVolume, false);
        document.getElementById('getpicture').addEventListener('click', getPicture, false);
        document.getElementById('testhole').addEventListener('click', testhole, false);
        document.getElementById('contact').addEventListener('click', addContact, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        navigator.globalization.getPreferredLanguage(function (language) {
                translate(language.value)
            }
        );
        showCarrierTypeMessage();
        getLocation();
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        console.log('Received Event: ' + id);
    }
};

function showCarrierTypeMessage() {
    document.getElementById("connectioninput").value = app.connectionType;
    switch (app.connectionType){
        case "wifi":
            navigator.notification.alert("We are not doing repairs at home.");
            break;
        case "none":
            navigator.notification.alert("Sorry you almost tumbled. Please report this later when connected to a network.");
            break;
        case "cellular":
        case "unknown":
        default:
            //no message required
            break;
    }
}

function onResume() {
    //navigator.notification.alert("Welcome back!");
}

function onVolume() {
    //navigator.notification.alert("Not implemented yet :(");
}

function getLocation(){
    navigator.geolocation.getCurrentPosition(function (loc) {
        document.getElementById("long").value = loc.coords.longitude;
        document.getElementById("lat").value = loc.coords.latitude;
    });
}

function getPicture() {
    console.log(app.connectionType);
    var selected = document.getElementById("selectedpic");

    if(app.connectionType == "Cellular" || app.connectionType == "unknown"){ //cellular can bug out and become unknown sometimes
        navigator.camera.getPicture(function (uri) {
            selected.src = uri;
        }, null, {quality:75});
    }
    else{
        fileChooser.open(function(uri) {
            selected.src = uri;
        });
        //plugin add http://github.com/don/cordova-filechooser.git
    }
}

function testhole() {
    //navigator.notification.alert("Please jump into the hole and press OK while falling.");
    alert("Please jump into the hole and press OK while falling.");//notification alert doesn't block thread, alert does.
    navigator.accelerometer.getCurrentAcceleration(function (res) {
        document.getElementById("measure").value = res.y;
    },
    function () {
        navigator.notification.alert("Measurement failed :(");
    });
}

function translate(lang) {
    console.log(lang);
    if(lang == "nl-BE"){
        document.getElementById("lblConType").innerHTML = "Type connectie:";//there's a better way to do this, probably
        document.getElementById("lblLat").innerHTML = "Latitude:";
        document.getElementById("lblLong").innerHTML = "Longitude:";
        document.getElementById("lblData").innerHTML = "Data van de meting:";
    }
    else if(lang == "en_GB" || lang == "en-US"){
        document.getElementById("lblConType").innerHTML = "Connection type:";
        document.getElementById("lblLat").innerHTML = "Latitude:";
        document.getElementById("lblLong").innerHTML = "Longitude:";
        document.getElementById("lblData").innerHTML = "Measuring data:";
    }
    else{
        navigator.notification.confirm(
            'Your system language is not supported, what language would you like to use?', function (index) {
                if(index){
                    translate("nl-BE");
                }
                else{
                    translate("en-GB")
                }
            },'Language', ['Nederlands','English']);
    }
}

function addContact() {
    var options      = new ContactFindOptions();
    options.filter   = "Will E Coyote"; //filter on this
    options.multiple = true; //allow multiple results
    var fields       = ["displayName", "name"]; //search these fields

    var contact = navigator.contacts.find(fields,
        function(res){
            console.log("Search successful.");
            console.log(res);
            if(res.length == 0){ //contact doesn't exist
                console.log("adding contact");
                var cont = navigator.contacts.create({"displayName":"Will E Coyote"});
                cont.emails = [new ContactField("Work", "willecoyote@acme.com", false)];
                cont.name = {
                    familyName : "Coyote",
                    givenName:"Will",
                    middleName : "E"
                };
                cont.save();
            }
            else{
                navigator.notification.alert("Contact exists!");
            }
        },
        function(){
            console.log("Search failed.")
        }
        , options);
}

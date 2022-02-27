var sseAdress;
var coreProps = document.getElementById("coreProps");

var app = 'CLOCK';
var display_name = 'Clock';
var time_event = 'TIME';

var go = false;
var interval;

coreProps.onchange = function()
{
    if (coreProps.files.length !== 0) 
    {
        var corePropsFile = coreProps.files[0];
        if(corePropsFile.size <100)
        {
            var reader = new FileReader();
            reader.onloadend = function()
            {
                var json = reader.result;
                try
                {
                    var corePropsObject = JSON.parse(json);
                    sseAddress = corePropsObject.address;
                } catch(e) 
                {
                    console.error(e);
                }
            }
            reader.readAsBinaryString(corePropsFile);
        }
    }
}

function sendJSON(json, url)
{
    var request = new XMLHttpRequest();
    try {
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(json));
    } catch(e)
    {
        console.error(e);
    }
}

function registerClock()
{
    var clockMetadata = {
        "game" : app,
        "game_display_name": display_name,
    }
    sendJSON(clockMetadata, "http://" + sseAddress + "/game_metadata");
}

function bindClockEvent()
{
    clockHandler = {
        "game": app,
        "event": time_event,
        "icon_id": 15,
        "handlers": [
            {
                "device-type": "screened",
                "mode": "screen",
                "zone": "one",
                "datas": [{
                  "has-text": true,
                  "context-frame-key": "Aktualna godzina:, <Event Value>",
                  'length-millis': 1000,
                  "icon_id": 15,
                  //"value_optional": true
                }]
            }
        ]
    }
    sendJSON(clockHandler, "http://" + sseAddress + "/bind_game_event");
}

function sendTime()
{
    var date = new Date();
    var hour = date.getHours();
    if(hour<10) hour = "0"+hour.toString();
    var minute = date.getMinutes();
    if(minute<10) minute = "0"+minute.toString();
    var seconds = date.getSeconds();
    if(seconds<10) seconds = "0"+seconds.toString();
    var czas = hour+":"+minute+":"+seconds;
    eventData = {
        "game": app,
        "event": time_event,
        "data": { 'value': czas }
        
    }
    console.log(czas);
    sendJSON(eventData,"http://" + sseAddress + "/game_event");
    if(go==false) clearInterval(interval);
}

function pokaz()
{
    go = true;
    registerClock();
    bindClockEvent();
    interval = setInterval("sendTime()", 1000);
}

function stop()
{
    go = false;
}




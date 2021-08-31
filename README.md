**Update:** the tool is now featured by IFTTT offcially! Check out [the post](https://help.ifttt.com/hc/en-us/articles/360059005834-How-to-add-a-delay-to-an-IFTTT-action) in IFTTT Help Center for detailed instructions!

## Background

Ifttt is the de facto hub for smart home now. Nearly everything can be connected to it and personally I have ~20 connected devices (hue, WeMo, echo, lock, thermostat, ...) and tens of recipes. But one thing ifttt still cannot do is adding delay to the recipes. Say, I have a good night trigger which will dim the bedroom lights when Alexa hears I say good night to her. But using official ifttt channels, you cannot further turn off the lights after 15 minutes. There are some discussions [online](http://webapps.stackexchange.com/questions/33674/ifttt-can-you-specify-a-delay-for-an-action) but looks there are no easy solutions yet. 

But from a coding perspective, it shouldn't be too hard. So I wrote a simple web service doing this open to the public. The background is, ifttt has a useful channel named "Maker". Its action allows you to visit a certain URL, and the trigger allows you to listen on a secret URL. It will be triggered when anyone visits the URL. And my solution is to provide a web service, which takes the secret URL of the Maker channel and how long is the delay as input, and visits that URL after the delay. Then for my example of goodnight recipe, I will first set up a recipe that if a secret URL (say, with secret word Magic) is triggered, then turn off the bedroom lights. And for the Alexa recipe, it will dim the light and also send out a web request to my service, specifying the secret word Magic and delay of 15 minutes. By this way, after 15 minutes, the secret URL will be visited and the lights can be turned off. 

Currently the API is available at `http://lab.grapeot.me/ifttt/delay?event={EVENT}&t={DELAY IN MINUTES}&key={YOUR KEY}`. `EVENT` is whatever event you want the Maker channel to listen for. And `YOUR_KEY` can also be found in the Maker channel. For example, in our previous Alexa example, I will put `http://lab.grapeot.me/ifttt/delay?event=Magic&t=15&key=MY_KEY` as the URL. And visit this URL whenever Alexa hears good night from me.

Enjoy! And let me know if you have questions.

## API

* `delay?event={EVENT}&t={DELAY_IN_MINUTES}&key={IFTTT_KEY}&reset={0,1}`: trigger the IFTTT `event` with the given `key`, after `t` minutes, limited to 35791 minutes. Decimal values are supported. If `reset` is set to 1, all existing timers of the given key and event will be canceled, and a new timer will be created with the given parameters. That is, it "resets" the timer.
* `cancel?event={EVENT}&key={IFTTT_KEY}`: cancel all the existing timers of the given `key` and `event`.

## Donation

This is a free service hosted on my personal server. If you like this tool and would like to help me offset the server cost, feel free to [donate through Paypal](https://www.paypal.com/donate?business=3SPXYULC2DV84&no_recurring=0&item_name=Show+your+support+for+IFTTT+Delay&currency_code=USD).

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <FastLED.h>

#define MAX_BRIGHTNESS 0x30

CRGB led[1];
AsyncWebServer* server;
uint8_t brightness = 0x00;
boolean up = true;
boolean dim = false;

boolean video = false;
boolean audio = false;
boolean noSession = false;

void setup() {
  delay(300);
  FastLED.addLeds<WS2812B, 1, GRB>(led, 1);
  led[0] = CRGB::Red;
  FastLED.setBrightness(MAX_BRIGHTNESS);
  FastLED.show();
  Serial.begin(115200);
  Serial.println();

  WiFi.hostname("onair-sign");
  WiFi.begin("****", "****");

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  led[0] = CRGB::Yellow;
  FastLED.show();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  server = new AsyncWebServer(80);
  server->on("/status", HTTP_GET, [](AsyncWebServerRequest* request) {
    for (size_t i = 0; i < request->params(); i++) {
      if (request->getParam(i)->name() == "video") {
        video = request->getParam(i)->value() == "true";
      }
      if (request->getParam(i)->name() == "audio") {
        audio = request->getParam(i)->value() == "true";
      }
      if (request->getParam(i)->name() == "noSession") {
        noSession = request->getParam(i)->value() == "true";
      }
    }
    if (noSession) {
      led[0] = CRGB::Green;
    } else if (!video && !audio) {
      led[0] = CRGB::Yellow;
    } else {
      led[0] = CRGB::Red;
    }
    Serial.printf("status audio %d video %d noSession %d\n", audio, video, noSession);
    request->send(200);
  });
  server->begin();
}

void loop() {
  if (up) {
    if (brightness >= MAX_BRIGHTNESS) {
      up = false;
    }
    brightness++;
  } else {
    if (brightness - 1 == 0) {
      up = true;
    }
    brightness--;
  }
  FastLED.setBrightness(brightness);
  FastLED.delay(20);
  FastLED.show();
}

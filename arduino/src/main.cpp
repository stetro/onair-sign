#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <FastLED.h>

#define MAX_BRIGHTNESS 0x30

CRGB led[1];
AsyncWebServer* server;
uint8_t brightness = 0x00;
boolean up = true;

void setup() {
  delay(300);
  FastLED.addLeds<WS2812B, 1, GRB>(led, 1);
  led[0] = CRGB::Yellow;
  FastLED.setBrightness(0x18);
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

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  server = new AsyncWebServer(80);
  server->on("/offline", HTTP_GET, [](AsyncWebServerRequest* request) {
    led[0] = CRGB::Green;
    Serial.println("offline");
    request->send(200);
  });
  server->on("/video", HTTP_GET, [](AsyncWebServerRequest* request) {
    led[0] = CRGB::Red;
    Serial.println("video");
    request->send(200);
  });
  server->on("/audio", HTTP_GET, [](AsyncWebServerRequest* request) {
    led[0] = CRGB::Yellow;
    Serial.println("audio");
    request->send(200);
  });
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
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

#include "pebble.h"

#define ACCEL_STEP_MS 10

static Window *window;

static AppTimer *timer;

AccelData accel_LastNonVibrating;
int vibrateTimeout;

static bool sendToPhone(AccelData accel,int magnetic_heading) {

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  
  Tuplet valuex = TupletInteger(0, accel.x);
  Tuplet valuey = TupletInteger(1, accel.y);
  Tuplet valuez = TupletInteger(2, accel.z);
  Tuplet valueh = TupletInteger(3, magnetic_heading);
  
  dict_write_tuplet(iter, &valuex);
  dict_write_tuplet(iter, &valuey);
  dict_write_tuplet(iter, &valuez);
  dict_write_tuplet(iter, &valueh);
  dict_write_end(iter);

  app_message_outbox_send();
  return true;
}

void out_sent_handler(DictionaryIterator *sent, void *context) {
   // outgoing message was delivered
 }


void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  // outgoing message failed
}

void Vibrate(){
  vibrateTimeout=10;
   // Vibe pattern: ON for 200ms, OFF for 100ms, ON for 400ms:
  static const uint32_t const segments[] = { 50, 100, 50 };
  VibePattern pat = {
    .durations = segments,
    .num_segments = ARRAY_LENGTH(segments),
  };
  vibes_enqueue_custom_pattern(pat);
}
void in_received_handler(DictionaryIterator *iter, void *context) {
  // incoming message received
  // Check for fields you expect to receive
  Tuple *command = dict_find(iter, 0);

  // Act on the found fields received
  APP_LOG(APP_LOG_LEVEL_DEBUG,"strcmp %d",strcmp("vibrate",command->value->cstring));
  if (strcmp("vibrate",command->value->cstring)==0) {
//    vibes_short_pulse();
//    light_enable_interaction();
    Vibrate();
  }
}


void in_dropped_handler(AppMessageResult reason, void *context) {
  // incoming message dropped
}

static void timer_callback(void *data) {
  AccelData accel = (AccelData) { .x = 0, .y = 0, .z = 0 };
  CompassHeadingData compassdata;
  
  accel_service_peek(&accel);
  compass_service_peek(&compassdata);
  //only send data which was non-vibrating
  if (vibrateTimeout>0){
    sendToPhone(accel_LastNonVibrating,TRIGANGLE_TO_DEG(compassdata.magnetic_heading));
    vibrateTimeout--;
  }
  else{
    sendToPhone(accel,TRIGANGLE_TO_DEG(compassdata.magnetic_heading));
    accel_LastNonVibrating = accel;
  }

  
  timer = app_timer_register(ACCEL_STEP_MS, timer_callback, NULL);
  

}

static void window_load(Window *window) {
  
}

static void window_unload(Window *window) {

}


static void init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload
  });
  window_stack_push(window, true /* Animated */);
  window_set_background_color(window, GColorBlack);
  
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_sent(out_sent_handler);
  app_message_register_outbox_failed(out_failed_handler);
  app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
//  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  const uint32_t inbound_size = 64;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);


  accel_data_service_subscribe(0, NULL);

  timer = app_timer_register(ACCEL_STEP_MS, timer_callback, NULL);
  APP_LOG(APP_LOG_LEVEL_DEBUG,"Watch::init() done.");
  
}

static void deinit(void) {
  accel_data_service_unsubscribe();
  window_destroy(window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}



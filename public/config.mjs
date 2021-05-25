let config = {
  canvas_width: 640,
  canvas_height: 480,
  banner_side: 12,
  banner_top: 40,
  window_left_margin: 10,
  window_right_margin: 10,
  window_top_margin: 50,
  window_bottom_margin: 10,
  window_border: 2,
  rank_x: 450, 
  rank_width: 200,
  move_buffer: 30,
}

config['game_width'] = config.canvas_width - config.window_left_margin - config.window_right_margin;
config['game_height'] = config.canvas_height - config.window_top_margin - config.window_bottom_margin;

config['play_min_x'] = config. window_left_margin + config.move_buffer;
config['play_max_x'] = config. window_left_margin + config.game_width - config.move_buffer;
config['play_min_y'] = config.move_buffer + config.banner_top;
config['play_max_y'] = config.canvas_height - config.window_bottom_margin - config.move_buffer;


try {
  module.exports = config;
} catch(e) {}

export default config;
<?php

// ----------------------------------------------------------------------
// PREAMBLE
//
// Sets up some well-known values for the configuration environment.
//
// Most likely do not need to edit anything in this section.
// ----------------------------------------------------------------------

include_once 'install-funcs.inc.php';

// set default timezone
date_default_timezone_set('UTC');

$OLD_PWD = $_SERVER['PWD'];

// work from lib directory
chdir(dirname($argv[0]));

if ($argv[0] === './pre-install.php' || $_SERVER['PWD'] !== $OLD_PWD) {
  // pwd doesn't resolve symlinks
  $LIB_DIR = $_SERVER['PWD'];
} else {
  // windows doesn't update $_SERVER['PWD']...
  $LIB_DIR = getcwd();
}

// Use all of the defaults for automated builds.
if (count($argv) > 1 && $argv[1] === '--non-interactive') {
  $NO_PROMPT = true;
} else {
  $NO_PROMPT = false;
}

$APP_DIR = dirname($LIB_DIR);
$CONF_DIR = $APP_DIR . DIRECTORY_SEPARATOR . 'conf';

$CONFIG_FILE = $CONF_DIR . DIRECTORY_SEPARATOR . 'config.ini';
$APACHE_CONFIG_FILE = $CONF_DIR . DIRECTORY_SEPARATOR . 'httpd.conf';


// ----------------------------------------------------------------------
// CONFIGURATION
//
// Define the configuration parameters necessary in order
// to install/run this application. Some basic parameters are provided
// by default. Ensure that you add matching keys to both the $DEFAULTS
// and $HELP_TEXT arrays so the install process goes smoothly.
//
// This is the most common section to edit.
// ----------------------------------------------------------------------

// setup configuration defaults and help
$DEFAULTS = array(
  'APP_DIR' => $APP_DIR,
  'DATA_DIR' => str_replace('/apps/', '/data/', $APP_DIR),
  'MOUNT_PATH' => '',
  'DB_DSN' => 'sqlite:testdata.db',
  'DB_USER' => '',
  'DB_PASS' => '',
  'USE_DATABASE_SESSIONS' => 'true',
  'MAGPROC_DSN' => 'mysql:host=hostname;dbname=dbname',
  'MAGPROC_USER' => '',
  'MAGPROC_PASS' => '',
  'REALTIME_DATA_URL' => '/map/observatories_data.json.php'
);

$HELP_TEXT = array(
  'APP_DIR' => 'Absolute path to application root directory',
  'DATA_DIR' => 'Absolute path to application data directory',
  'MOUNT_PATH' => 'Url path to application',
  'DB_DSN' => 'Database connection DSN string',
  'DB_USER' => 'Read/write username for database connections',
  'DB_PASS' => 'Password for database user',
  'USE_DATABASE_SESSIONS' => 'Store session information in database',
  'MAGPROC_DSN' => 'Database connection DSN string for magproc database',
  'MAGPROC_USER' => 'Read/write username for magproc database connections',
  'MAGPROC_PASS' => 'Password for database user',
  'REALTIME_DATA_URL' => 'Base URL for Realtime Data Factory'
);


// ----------------------------------------------------------------------
// MAIN
//
// Run the interactive configuration and write configuration files to
// to file system (httpd.conf and config.ini).
//
// Edit this section if this application requires additional installation
// steps such as setting up a database schema etc... When editing this
// section, note the helpful install-funcs.inc.php functions that are
// available to you.
// ----------------------------------------------------------------------

include_once 'configure.php';


// output apache configuration
file_put_contents($APACHE_CONFIG_FILE, '
  # auto generated by ' . __FILE__ . ' at ' . date('r') . '
  Alias ' . $CONFIG['MOUNT_PATH'] . ' ' . $CONFIG['APP_DIR'] . '/htdocs
  <Location ' . $CONFIG['MOUNT_PATH'] . '>
    Order Allow,Deny
    Allow from all
  </Location>
  RewriteEngine on

  RewriteCond %{HTTPS} !=on
  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/(.*)$ ' .
      'https://%{SERVER_NAME}' . $CONFIG['MOUNT_PATH'] . '/$1 [R,L]

  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/observation_data/(.*)$ ' .
      $CONFIG['MOUNT_PATH'] . '/observation_data.php?id=$1 [L,PT]
  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/observatory_detail_feed/(.*)$ ' .
      $CONFIG['MOUNT_PATH'] . '/observatory_detail_feed.php?id=$1 [L,PT]
  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/observatory_summary_feed/?$ ' .
      $CONFIG['MOUNT_PATH'] . '/observatory_summary_feed.php [L,PT]
  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/observation/(.*)$ ' .
      $CONFIG['MOUNT_PATH'] . '/observation.php?id=$1 [L,PT]
  RewriteRule ^' . $CONFIG['MOUNT_PATH'] . '/observatory/(.*)$ ' .
      $CONFIG['MOUNT_PATH'] . '/index.php?id=$1 [L,PT]
');

if (!$NO_PROMPT) {
  $answer = configure('DO_DB_SETUP', 'N',
      'Would you like to set up the absolutes database at this time');
  if (responseIsAffirmative($answer)) {
    include_once 'setup_database.php';
  }
}

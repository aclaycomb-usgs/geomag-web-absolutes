<?php

if (!isset($TEMPLATE)) {
  // load configuration
  include_once '../conf/config.inc.php';

  if (isset($_POST['username'])) {
    // trying to authenticate
    $user = $USER_FACTORY->authenticate($_POST['username'], $_POST['password']);

    if ($user !== null) {
      if ($user['enabled'] === 'Y') {
        // logged in
        session_start();
        $_SESSION['userid'] = $user['id'];
        session_write_close();
      } else {
        $error = 'User is no longer enabled';
      }
    } else {
      $error = 'Invalid username or password';
    }
  }

  if (isset($_SESSION['userid'])) {
    // logged in, redirect to main page
    header ('Location: ' . $MOUNT_PATH . '/index.php');
    exit();
  }

  $TITLE = 'Log in';
  $NAVIGATION = true;
  include 'template.inc.php';
}

?>


<form method="post" action="login.php">
<?php
  if (isset($error)) {
    echo '<div class="alert error">' . $error . '</div>';
  }
?>
  <label for="username">Username</label>
  <input id="username" name="username" type="text"/>

  <label for="password">Password</label>
  <input id="password" name="password" type="password"/>

  <button type="submit">Log in</button>
</form>

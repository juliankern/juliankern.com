<?php 
    if (!$_POST) {
        header('Location: http://juliankern.com');
    }
    
    //Path to autoload.php from current location
    require_once './vendor/autoload.php';
    use Nette\Mail\Message;
    use Nette\Mail\SendmailMailer;
    
    function getUserIP() {
        $client  = @$_SERVER['HTTP_CLIENT_IP'];
        $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote  = $_SERVER['REMOTE_ADDR'];

        if(filter_var($client, FILTER_VALIDATE_IP)) {
            $ip = $client;
        }
        elseif(filter_var($forward, FILTER_VALIDATE_IP)) {
            $ip = $forward;
        }
        else {
            $ip = $remote;
        }

        return $ip;
    }

    if (!array_key_exists('g-recaptcha-response', $_POST)) {
        $return = Array('error' => true, 'message' => 'error.captchamissing');
    } elseif (!array_key_exists('name', $_POST)) {
        $return = Array('error' => true, 'message' => 'error.nameamissing');
    } elseif (!array_key_exists('email', $_POST)) {
        $return = Array('error' => true, 'message' => 'error.emailamissing');
    } elseif (!array_key_exists('message', $_POST)) {
        $return = Array('error' => true, 'message' => 'error.messageamissing');
    } else {
        $return = $_POST;

        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = array(
            'secret' => 'RECAPTCHASECRET', 
            'response' => $_POST['g-recaptcha-response'],
            'remoteip' => getUserIP()
        );

        // use key 'http' even if you send the request to https://...
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            )
        );
        $context  = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        
        if ($result === FALSE) { die(json_encode([ "error" => true, "message" => "error.posterror" ])); }
        else {
            $recaptchaApi = json_decode($result);
            
            if($recaptchaApi->success == true) {                
                $mail = new Message;
                $mail->setFrom($_POST['email'], $_POST['name'])
                    ->addTo('contactform@juliankern.com')
                    ->addReplyTo($_POST['email'], $_POST['name'])
                    ->setSubject('Neue Nachricht im Kontaktformular!')
                    ->setBody(strip_tags($_POST['message']))
                ;
                        
                try {
                    $mailer = new Nette\Mail\SmtpMailer(array(
                        'host' => 'MAILHOST',
                        'username' => 'noreply@example.com',
                        'password' => 'MAILPASSWORD'
                    ));
                    echo $mailer->send($mail);
                } catch (Exception $e) {
                    die(json_encode([ "error" => true, "code" => "error.mailnotsent" ]));
                }

            } else {
                die(json_encode([ 'error' => true, 'message' => 'error.capchaerror' ]));
            }
        }

    }
    
    echo json_encode([ "error" => false ]);
?>


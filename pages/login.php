<?php
// login.php - formulario simple de acceso (sin base de datos)
// Recomendación: conecta con backend/BD cuando tengas el sistema listo.

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Demo: valida solo que no vengan vacíos
    if ($email === '' || $password === '') {
        $error = 'Completa email y contraseña.';
    } else {
        // Aquí iría la autenticación real.
        // Por ahora redirigimos a una página de usuario.
        header('Location: usuario.html');
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="../css/plan-empresa.css">
    <style>
        /* Ajustes locales para que el login se vea bien aunque herede estilos */
        .login_wrapper{
            max-width: 520px;
            margin: 40px auto;
            padding: 18px;
            background: rgba(183,65,65,0.10);
            border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.08);
        }
        .login_wrapper h1{
            margin-bottom: 14px;
            font-size: 26px;
        }
        .login_wrapper .error{
            background: #ffeded;
            border: 1px solid #ffb3b3;
            color: #b30000;
            padding: 10px 12px;
            border-radius: 12px;
            margin-bottom: 12px;
            font-weight: 700;
        }
        .login_form{
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .login_form input{
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(0,0,0,0.2);
            outline: none;
        }
        .btn_submit{
            border: none;
            border-radius: 12px;
            padding: 10px 16px;
            background: #fff;
            color: #222;
            font-weight: 900;
            cursor: pointer;
            margin-top: 6px;
        }
        .btn_submit:hover{ transform: translateY(-1px); }
    </style>
</head>
<body>
    <div class="login_wrapper">
        <h1>Acceso</h1>

        <?php if ($error !== ''): ?>
            <div class="error"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>

        <form class="login_form" action="login.php" method="post">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" placeholder="tuemail@correo.com" required>

            <label for="password">Contraseña</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required>

            <button class="btn_submit" type="submit">Entrar</button>
        </form>
    </div>
</body>
</html>


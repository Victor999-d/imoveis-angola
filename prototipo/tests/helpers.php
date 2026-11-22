<?php
/**
 * Funções isoladas para testes unitários
 */

function test_formatMoney($value): string {
    return number_format((float)$value, 0, ',', '.') . ' Kz';
}

function test_slugify(string $text): string {
    $text = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
    $text = strtolower(preg_replace('/[^a-z0-9]+/', '-', $text));
    return trim($text, '-');
}

function test_e(?string $str): string {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

function test_calculateCommission(float $monthlyRent, float $percentage, ?float $fixed = null): float {
    $percentValue = ($monthlyRent * $percentage) / 100;
    if ($fixed && $fixed > 0) {
        return $percentValue + $fixed;
    }
    return $percentValue;
}

function test_validateEmail(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function test_validatePassword(string $password, int $minLen = 6): bool {
    return strlen($password) >= $minLen;
}

function test_roleAllowed(string $role, array $allowed): bool {
    return in_array($role, $allowed, true);
}

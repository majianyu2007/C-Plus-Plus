// ============================================================================
// 数值类型模板 - 有理数、复数、高精度计算
// ============================================================================

#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

// ============================================================================
// 1. 有理数类 (Rational Number)
// ============================================================================
/*
 * 特性：
 * - 精确表示分数（无浮点误差）
 * - 自动化简到最简分数形式
 * - 完整的算术运算符重载
 * - 流操作符支持
 * 
 * 应用场景：
 * - 精确数值计算
 * - 数学计算中避免浮点误差
 * - 金融计算中的精确分数表示
 * 
 * 复杂度：
 * - 运算：O(log(min(num, den))) - GCD 计算
 * - 规范化：O(log(min(num, den)))
 */

class Rational {
private:
    long long num;  // 分子
    long long den;  // 分母
    
    // 规范化：确保分母为正，化简到最简形式
    void normalize() {
        if (den == 0) {
            throw invalid_argument("Denominator cannot be zero");
        }
        
        // 分母变为正数
        if (den < 0) {
            num = -num;
            den = -den;
        }
        
        // 化简到最简形式
        long long g = gcd(llabs(num), llabs(den));
        if (g == 0) {
            den = 1;
        } else {
            num /= g;
            den /= g;
        }
    }
    
    // 辅助函数：求最大公约数（欧几里得算法）
    static long long gcd(long long a, long long b) {
        while (b != 0) {
            long long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }

public:
    // 构造函数
    Rational(long long n = 0, long long d = 1) : num(n), den(d) {
        normalize();
    }
    
    // 从浮点数转换（精度：百万分之一）
    Rational(double x) {
        const long long base = 1000000;
        num = static_cast<long long>(x * base + (x >= 0 ? 0.5 : -0.5));
        den = base;
        normalize();
    }
    
    // 赋值运算符（浮点版本）
    Rational& operator=(double x) {
        const long long base = 1000000;
        num = static_cast<long long>(x * base + (x >= 0 ? 0.5 : -0.5));
        den = base;
        normalize();
        return *this;
    }
    
    // 算术运算
    Rational operator+(const Rational& rhs) const {
        return Rational(num * rhs.den + rhs.num * den, den * rhs.den);
    }
    
    Rational operator-(const Rational& rhs) const {
        return Rational(num * rhs.den - rhs.num * den, den * rhs.den);
    }
    
    Rational operator*(const Rational& rhs) const {
        return Rational(num * rhs.num, den * rhs.den);
    }
    
    Rational operator/(const Rational& rhs) const {
        if (rhs.num == 0) {
            throw invalid_argument("Divisor cannot be zero");
        }
        return Rational(num * rhs.den, den * rhs.num);
    }
    
    // 一元运算符
    Rational& operator++() {  // 前缀++
        num += den;
        return *this;
    }
    
    Rational operator++(int) {  // 后缀++
        Rational temp(*this);
        ++(*this);
        return temp;
    }
    
    Rational operator+() const { return *this; }
    Rational operator-() const { return Rational(-num, den); }
    
    // 比较运算
    bool operator==(const Rational& rhs) const {
        return num * rhs.den == rhs.num * den;
    }
    
    bool operator!=(const Rational& rhs) const {
        return !(*this == rhs);
    }
    
    bool operator<(const Rational& rhs) const {
        return num * rhs.den < rhs.num * den;
    }
    
    bool operator>(const Rational& rhs) const {
        return rhs < *this;
    }
    
    bool operator<=(const Rational& rhs) const {
        return !(rhs < *this);
    }
    
    bool operator>=(const Rational& rhs) const {
        return !(*this < rhs);
    }
    
    // 流操作符
    friend ostream& operator<<(ostream& os, const Rational& r) {
        os << r.num;
        if (r.den != 1) {
            os << "/" << r.den;
        }
        return os;
    }
    
    friend istream& operator>>(istream& is, Rational& r) {
        string token;
        if (!(is >> token)) return is;
        
        size_t pos = token.find('/');
        if (pos == string::npos) {
            r.num = stoll(token);
            r.den = 1;
        } else {
            r.num = stoll(token.substr(0, pos));
            r.den = stoll(token.substr(pos + 1));
        }
        r.normalize();
        return is;
    }
    
    // 类型转换
    explicit operator double() const {
        return static_cast<double>(num) / den;
    }
};


// ============================================================================
// 2. 复数类 (Complex Number)
// ============================================================================
/*
 * 表示：a + bi，其中 a 是实部，b 是虚部
 * 
 * 应用场景：
 * - 信号处理
 * - 电路分析
 * - 控制系统
 * - 量子计算
 * 
 * 时间复杂度：所有操作 O(1)
 */

class Complex {
private:
    double real_;
    double imag_;

public:
    // 构造函数
    Complex(double r = 0, double i = 0) : real_(r), imag_(i) {}
    
    // 获取器
    double real() const { return real_; }
    double imag() const { return imag_; }
    
    // 共轭复数
    Complex conjugate() const {
        return Complex(real_, -imag_);
    }
    
    // 模（绝对值）
    double magnitude() const {
        return sqrt(real_ * real_ + imag_ * imag_);
    }
    
    // 幅角（弧度）
    double argument() const {
        return atan2(imag_, real_);
    }
    
    // 算术运算
    Complex operator+(const Complex& rhs) const {
        return Complex(real_ + rhs.real_, imag_ + rhs.imag_);
    }
    
    Complex operator-(const Complex& rhs) const {
        return Complex(real_ - rhs.real_, imag_ - rhs.imag_);
    }
    
    Complex operator*(const Complex& rhs) const {
        // (a+bi)(c+di) = (ac-bd) + (ad+bc)i
        return Complex(
            real_ * rhs.real_ - imag_ * rhs.imag_,
            real_ * rhs.imag_ + imag_ * rhs.real_
        );
    }
    
    Complex operator/(const Complex& rhs) const {
        double denom = rhs.real_ * rhs.real_ + rhs.imag_ * rhs.imag_;
        if (denom == 0) {
            throw invalid_argument("Division by zero");
        }
        Complex conj = rhs.conjugate();
        Complex num = (*this) * conj;
        return Complex(num.real_ / denom, num.imag_ / denom);
    }
    
    // 流操作符
    friend ostream& operator<<(ostream& os, const Complex& c) {
        os << c.real_;
        if (c.imag_ >= 0) os << "+";
        os << c.imag_ << "i";
        return os;
    }
};


// ============================================================================
// 3. 高精度计算 (High Precision)
// ============================================================================
/*
 * 原理：
 * - 使用 vector<int> 存储大整数
 * - 每个元素存一位数字（0-9）
 * - 从低位到高位存储（例如：123 存为 [3,2,1]）
 * 
 * 应用场景：
 * - 阶乘计算（n > 20）
 * - 大数相加/相乘
 * - 组合数学计算
 * 
 * 复杂度：
 * - 加法：O(max(len_a, len_b))
 * - 乘法：O(len_a * len_b) 或 O(len_a * log len_b)
 */

class BigInteger {
private:
    vector<int> digits;  // 低位在前
    
public:
    // 构造函数
    BigInteger(long long n = 0) {
        if (n == 0) {
            digits.push_back(0);
        } else {
            n = llabs(n);
            while (n > 0) {
                digits.push_back(n % 10);
                n /= 10;
            }
        }
    }
    
    // 静态方法：高精度加法
    static BigInteger add(const BigInteger& a, const BigInteger& b) {
        BigInteger result;
        result.digits.clear();
        
        int carry = 0;
        size_t maxLen = max(a.digits.size(), b.digits.size());
        
        for (size_t i = 0; i < maxLen || carry; i++) {
            int sum = carry;
            if (i < a.digits.size()) sum += a.digits[i];
            if (i < b.digits.size()) sum += b.digits[i];
            
            result.digits.push_back(sum % 10);
            carry = sum / 10;
        }
        
        return result;
    }
    
    // 静态方法：高精度乘法（乘以整数）
    static BigInteger multiply(const BigInteger& a, long long k) {
        BigInteger result;
        result.digits.clear();
        
        long long carry = 0;
        for (int digit : a.digits) {
            long long prod = digit * k + carry;
            result.digits.push_back(prod % 10);
            carry = prod / 10;
        }
        
        while (carry > 0) {
            result.digits.push_back(carry % 10);
            carry /= 10;
        }
        
        return result;
    }
    
    // 打印高精度数字（高位在前）
    void print(ostream& os = cout) const {
        for (int i = digits.size() - 1; i >= 0; i--) {
            os << digits[i];
        }
    }
    
    // 获取数字长度
    size_t length() const {
        return digits.size();
    }
};


// ============================================================================
// 使用示例
// ============================================================================

/*
int main() {
    // 有理数示例
    {
        cout << "=== Rational Number ===\n";
        Rational r1(3, 4);
        Rational r2(2, 3);
        cout << "r1 = " << r1 << ", r2 = " << r2 << "\n";
        cout << "r1 + r2 = " << (r1 + r2) << "\n";
        cout << "r1 * r2 = " << (r1 * r2) << "\n";
    }
    
    // 复数示例
    {
        cout << "\n=== Complex Number ===\n";
        Complex c1(3, 4);
        Complex c2(1, 2);
        cout << "c1 = " << c1 << ", c2 = " << c2 << "\n";
        cout << "c1 + c2 = " << (c1 + c2) << "\n";
        cout << "c1 * c2 = " << (c1 * c2) << "\n";
    }
    
    // 高精度示例
    {
        cout << "\n=== High Precision ===\n";
        BigInteger a(123);
        BigInteger b(456);
        BigInteger sum = BigInteger::add(a, b);
        sum.print();
        cout << "\n";
        
        // 计算阶乘 5! = 120
        BigInteger fact(1);
        for (int i = 2; i <= 5; i++) {
            fact = BigInteger::multiply(fact, i);
        }
        cout << "5! = ";
        fact.print();
        cout << "\n";
    }
    
    return 0;
}
*/

/*
2.  设计并实现一个有理数类CRational，要求：  
(1) 用两个整数的比描述有理数;  
(2) 能够进行加、减、乘、除等算术运算;  
(3) 以分数形式输出有理数;  
(4) 提供double类型到有理数的类型转换;  
(5) 合理的初始化，注意检测分母和除数为0的错误，默认分子为0，分母为1。  
编写测试程序。
*/
#include <iostream>
#include <stdexcept>
#include <cmath>

using std::cout;
using std::endl;
using std::ostream;
using std::abs;

class CRational
{
    private:
        int numerator;      // 分子
        int denominator;    // 分母

        static int gcd(int a, int b)
        {
            while (b != 0) {
                int t = a % b;
                a = b;
                b = t;
            }
            return (a == 0) ? 1 : a;
        }
        
        void reduce()       // 化简分数
        {
            int g = gcd(abs(numerator), abs(denominator));
            numerator /= g;
            denominator /= g;
            if (denominator < 0) {
                numerator = -numerator;
                denominator = -denominator;
            }
        }

    public:
        CRational(int num = 0, int denom = 1)
        {
            if (denom == 0) {
                throw std::invalid_argument("分母不能为0");
            }
            numerator = num;
            denominator = denom;
            reduce();
        }
        
        CRational(double d)
        {
            const int scale = 1000000;
            numerator = static_cast<int>(std::round(d * scale));
            denominator = scale;
            reduce();
        }
        
        CRational operator+(const CRational& r) const
        {
            return CRational(numerator * r.denominator + r.numerator * denominator,
                            denominator * r.denominator);
        }
        
        CRational operator-(const CRational& r) const
        {
            return CRational(numerator * r.denominator - r.numerator * denominator,
                            denominator * r.denominator);
        }
        
        CRational operator*(const CRational& r) const
        {
            return CRational(numerator * r.numerator, denominator * r.denominator);
        }
        
        CRational operator/(const CRational& r) const
        {
            if (r.numerator == 0) {
                throw std::invalid_argument("除数不能为0");
            }
            return CRational(numerator * r.denominator, denominator * r.numerator);
        }
        
        operator double() const
        {
            return static_cast<double>(numerator) / denominator;
        }
        
        friend ostream& operator<<(ostream& os, const CRational& r)
        {
            os << r.numerator << "/" << r.denominator;
            return os;
        }

};

int main(void)
{
    try {
        CRational a(1, 2);
        CRational b(3, 4);

        cout << "a = " << a << endl;
        cout << "b = " << b << endl;

        cout << "a + b = " << (a + b) << endl;
        cout << "a - b = " << (a - b) << endl;
        cout << "a * b = " << (a * b) << endl;
        cout << "a / b = " << (a / b) << endl;

        CRational c(2.75);
        cout << "c (from double 2.75) = " << c << endl;
        cout << "(double)c = " << static_cast<double>(c) << endl;

        try {
            CRational invalid(1, 0);
            cout << invalid << endl;
        } catch (const std::invalid_argument& e) {
            cout << "捕获到初始化错误: " << e.what() << endl;
        }

        try {
            CRational zero(0, 1);
            CRational result = a / zero;
            cout << result << endl;
        } catch (const std::invalid_argument& e) {
            cout << "捕获到除法错误: " << e.what() << endl;
        }
    } catch (const std::exception& e) {
        cout << "程序异常: " << e.what() << endl;
        return 1;
    }

    return 0;
}
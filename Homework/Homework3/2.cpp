/*
2.  编写函数，将整数转换成字符串。例如，itoa(-123)，转换结果为“-123”。函数原型为：string itoa(int)。
*/
#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

string itoa(int num)
{
    if (num == 0) {
        return "0";
    }
    
    string result = "";
    bool negative = false;
    
    if (num < 0) {
        negative = true;
        num = -num;
    }
    
    while (num > 0) {
        result = char('0' + num % 10) + result;
        num /= 10;
    }
    
    if (negative) {
        result = "-" + result;
    }
    
    return result;
}

int main()
{
    // Test positive numbers
    cout << "Testing positive numbers:" << endl;
    cout << "itoa(123) = " << itoa(123) << endl;
    cout << "itoa(0) = " << itoa(0) << endl;
    cout << "itoa(9876) = " << itoa(9876) << endl;
    
    // Test negative numbers
    cout << "\nTesting negative numbers:" << endl;
    cout << "itoa(-456) = " << itoa(-456) << endl;
    cout << "itoa(-1) = " << itoa(-1) << endl;
    cout << "itoa(-9999) = " << itoa(-9999) << endl;
    
    return 0;
}
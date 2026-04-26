/*
4.  提取字符串中的数值。如果字符串中的内容为“ab7c d234bk jalf 34 78k3j4 a 59jfd45”，那么提取的数值依次是7, 234, 34, 78, 3, 4, 59, 45。
*/
#include <iostream>
#include <string>
#include <vector>
#include <cctype>

using std::cin;
using std::cout;
using std::endl;
using std::vector;
using std::string;
using std::isdigit;

int main(void)
{
    string str;
    getline(cin, str);
    vector<int> numbers;
    
    for (int i = 0; i < str.length(); i++) {
        if (isdigit(str[i])) {
            int num = 0;
            while (i < str.length() && isdigit(str[i])) {
                num = num * 10 + (str[i] - '0');
                i++;
            }
            numbers.push_back(num);
            i--;
        }
    }
    
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}
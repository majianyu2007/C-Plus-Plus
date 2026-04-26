/*
3.  编写程序，提示用户输入两个字符串，检测第二个字符串是否是第一个字符串的子串。
*/
#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main() {
    string str1, str2;
    
    cout << "请输入第一个字符串: ";
    getline(cin, str1);
    
    cout << "请输入第二个字符串: ";
    getline(cin, str2);
    
    if (str1.find(str2) != string::npos) {
        cout << "第二个字符串是第一个字符串的子串。" << endl;
    } else {
        cout << "第二个字符串不是第一个字符串的子串。" << endl;
    }
    
    return 0;
}
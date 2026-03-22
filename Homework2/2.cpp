/*
2.  编写程序比较两个string类型的字符串，然后编写另一个程序比较两个C风格字符串。
*/
#include <iostream>
#include <string>
#include <cstring>

using std::cin;
using std::cout;
using std::endl;
using std::string;
using std::strcmp;

void compareStrings() {
    string str1, str2;
    
    cout << "输入第一个字符串: ";
    getline(cin, str1);
    cout << "输入第二个字符串: ";
    getline(cin, str2);
    
    if (str1 == str2) {
        cout << "两字符串相等" << endl;
    } else if (str1 < str2) {
        cout << "第一个字符串小于第二个字符串" << endl;
    } else {
        cout << "第一个字符串大于第二个字符串" << endl;
    }
}

void compareCStrings() {
    char str1[100], str2[100];
    
    cout << "输入第一个C风格字符串: ";
    cin.getline(str1, 100);
    cout << "输入第二个C风格字符串: ";
    cin.getline(str2, 100);
    
    int result = strcmp(str1, str2);
    
    if (result == 0) {
        cout << "两字符串相等" << endl;
    } else if (result < 0) {
        cout << "第一个字符串小于第二个字符串" << endl;
    } else {
        cout << "第一个字符串大于第二个字符串" << endl;
    }
}

int main(void)
{
    int choice;
    
    cout << "选择比较方式:" << endl;
    cout << "1. 比较string类型字符串" << endl;
    cout << "2. 比较C风格字符串" << endl;
    cout << "请输入选择 (1 或 2): ";
    cin >> choice;
    cin.ignore(); // 清除输入缓冲区的换行符
    
    if (choice == 1) {
        compareStrings();
    } else if (choice == 2) {
        compareCStrings();
    } else {
        cout << "无效选择" << endl;
    }
    
    return 0;
}
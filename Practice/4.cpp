#include <iostream>
#include <string>

using std::getline;
using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void)
{
    string str1, str2;
    getline(cin, str1);
    getline(cin, str2);
    if (str1.find(str2) == string::npos)
    {
        cout << "-1" << endl;
    }
    else
    {
        cout << str1.find(str2) << endl;
    }
    return 0;
}
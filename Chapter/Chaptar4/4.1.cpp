#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

string to_bin(int num)
{
    string s;
    if(!num) return "0";
    while(num)
    {
        s += char((num % 2) + '0');
        num /= 2;
    }
    reverse(s.begin(), s.end());
    return s;
}

int main(void)
{
    int num;
    cin >> num;
    cout << to_bin(num) << endl;
    
    return 0;
}
#include <iostream>
#include <string>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::string;

int main(void)
{
    string s;
    cin >> s;

    int dotPos = s.find('.');
    s.erase(dotPos, 1);

    reverse(s.begin(), s.end());

    s.insert(1, ".");
    
    cout << s << endl;
    return 0;
}
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
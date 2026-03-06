#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>

using std::cout;
using std::endl;
using std::rand;
using std::srand;
using std::string;
using std::time;

int main(void)
{
    
    srand(static_cast<unsigned>(time(nullptr)));
    const string months[] = {
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    };
    int n = rand() % 12 + 1;
    cout << months[n - 1] << endl;

    return 0;
}
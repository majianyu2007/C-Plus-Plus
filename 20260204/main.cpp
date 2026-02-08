#include <iostream>
#include <string>

// if use stdio.h, try to use #include <cstdio>
using namespace std;

int main()
{
    // Hello World!
    cout << "Hello, World!" << endl;
    
    float score = 0;
    cout << "Enter your score: ";
    cin >> score;

    // if
    if(score >= 60)
    {
        cout << "Pass" << endl;
    }
    else
    {
        cout << "Fail" << endl;
    }
    
    // P34 Practice 7
    cout << "a\t" << "a^2\t" << "a^3" << endl;
    for (int a = 1; a <= 4; a++) 
    {
        cout << a << "\t" << a*a << "\t" << a*a*a << endl;
    }
    
    // For Windows: system("pause");

    return 0;
}
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    double height{0}, weight{0};
    cout << "Enter your height and weight(m, kg): ";
    cin >> height >> weight;
    double bmi = weight / (height * height);
    if (bmi < 18.5)
        cout << "Underweight" << endl;
    else if (bmi < 25)
        cout << "Normal" << endl;
    else if (bmi < 30)
        cout << "Overweight" << endl;
    else
        cout << "Obese" << endl;
    return 0;
}
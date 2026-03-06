#include <iostream>
#include <cmath>

using std::cout;
using std::endl;

#define PI acos(-1)

class Circle
{
private:
    double r;

public:
    Circle(double radius) : r(radius) {}
    
    double getCircumference()
    {
        return 2 * PI * r;
    }
    
    double getArea()
    {
        return PI * r * r;
    }
    
    void setRadius(double radius)
    {
        r = radius;
    }
    
    double getRadius()
    {
        return r;
    }
};

int main(void)
{
    Circle c1(6.5);
    cout << "面积：" << c1.getArea() << endl;
    cout << "周长：" << c1.getCircumference() << endl;
    return 0;
}
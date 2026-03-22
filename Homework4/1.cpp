#include <iostream>
#include <sstream>
#include <string>

using std::cout;
using std::endl;
using std::ostringstream;
using std::string;

class CFan
{
public:
    static constexpr int SLOW = 1;
    static constexpr int MEDIUM = 2;
    static constexpr int FAST = 3;

    CFan()
        : speed(SLOW), on(false), radius(5.0), color(0xFFFFFF)
    {
    }

    CFan(int speed, bool on, double radius, unsigned long color)
        : speed(speed), on(on), radius(radius), color(color)
    {
    }

    int getSpeed() const
    {
        return speed;
    }

    bool isOn() const
    {
        return on;
    }

    double getRadius() const
    {
        return radius;
    }

    unsigned long getColor() const
    {
        return color;
    }

    void setSpeed(int newSpeed)
    {
        if (newSpeed == SLOW || newSpeed == MEDIUM || newSpeed == FAST)
        {
            speed = newSpeed;
        }
    }

    void setOn(bool newOn)
    {
        on = newOn;
    }

    void setColor(unsigned long newColor)
    {
        color = newColor;
    }

    string status() const
    {
        ostringstream oss;
        if (on)
        {
            oss << "Fan is on, speed=" << speed << ", color=0x" << std::hex << color
                << std::dec << ", radius=" << radius;
        }
        else
        {
            oss << "Fan is off, color=0x" << std::hex << color << std::dec
                << ", radius=" << radius;
        }
        return oss.str();
    }

private:
    int speed;
    bool on;
    const double radius;
    unsigned long color;
};

int main()
{
    CFan fan1;
    CFan fan2(CFan::MEDIUM, true, 8.0, 0xFF0000);
    CFan fan3(CFan::FAST, false, 12.5, 0x0000FF);

    fan1.setOn(true);
    fan1.setSpeed(CFan::SLOW);
    fan1.setColor(0x00FF00);

    fan2.setSpeed(CFan::FAST);
    fan2.setColor(0xFFFF00);

    fan3.setOn(true);
    fan3.setSpeed(CFan::MEDIUM);

    cout << "fan1: " << fan1.status() << endl;
    cout << "fan2: " << fan2.status() << endl;
    cout << "fan3: " << fan3.status() << endl;

    return 0;
}
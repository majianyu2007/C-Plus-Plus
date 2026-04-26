/*
1.  设计一个名为CFan的类表示风扇，要求包括：  
(1) 3个名为SLOW 、MEDIUM 和FAST 的常量，值分别为1、2、3，表示风速;  
(2) int类型的私有数据成员speed，表示风扇的速度，默认值为SLOW;  
(3) bool类型的私有数据成员on，表示风扇是否打开，默认值为false;  
(4) double类型的私有数据成员radius，表示风扇的半径，创建后不可修改，默认值;  
(5) unsigned long类型的私有数据成员color，表示风扇的颜色，默认值为0xFFFFFF，表示白色;  
(6) 4个数据成员的访问器，非const成员的修改器;  
(7) 创建默认风扇的构造函数;  
(8) 根据参数值创建风扇的构造函数;  
(9) 成员函数status()，返回风扇的状态字符串：如果风扇是打开的，字符串中包括风扇的速度、颜色和半径；否则，返回的字符串中包括风扇关闭、颜色和半径。  
编写测试程序，创建三个不同颜色和大小的风扇，进行改变速度、开、关等操作，输出这些风扇的状态。
*/

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
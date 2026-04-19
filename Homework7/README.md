#### 第7次作业
1.  己知矩形类CRectangle的定义如下：
```cpp
class CRectangle {
protected:
    double width, height;
public:
    CRectangle(double id=1.0, double hei=1.0):width(wid),height(hei){}
    double getWidth(){return width;}
    void setWidth(double newWid){width = newWid;}
    double getHeight(){return height;}
    void setHeight(double newHei){height = newHei;}
    double area(){return width*height;}//面积
    double perimeter(){return (width+height)*2;}//周长
    void scale(double fw, double fh) {width*=fw; height*=fh;}//缩放
};
```
在CRectangle 类的基础上，设计并实现一个正方形类CSquare。

2.  己知整型链表类的部分声明如下：
```cpp
#include <list>
class CIntList {
private:
    list<int> lst;
public:
    CIntList() { lst.clear();}
    void insert_front(int x); //在表头插入元素x
    void insert_back(int x); //在表尾插入元素x
    int del_front(); //删除并返回第一个元素
    int del_back(); //删除并返回最后一个元素
    int front(); //返回第一个元素
    int back(); //返回最后一个元素
    bool empty(); //判断链表是否为空
};
```
在CIntList类的基础上，设计并实现一个整型堆栈类CIntStack。
提示：list链表类模板的使用可参考：http://www.cplusplus.com/reference/list/list/

3.  学生选修课程可用学生类和课程类之间的关联关系来建模。设计并实现这两个类以及它们的关联关系，具体要求如下：
（1）学生的属性有姓名和学号；
（2）课程的属性有课程名、编号和学分；
（3）通过课程类能知道选修了该课程的所有学生；
（4）通过学生类能知道自己选修了哪些课程。
编写测试程序，模拟学生选课的操作，选课完成后，打印某门课程的学生名单，对某位学生，统计选修课程的总学分数。
提示：使用前向引用声明，因为涉及到类的交叉引用。
```cpp
class CCourse;
//学生类
class CStudent{
    string name;
    unsigned id;
    vector<CCourse*> cs;
public:
    CStudent(string nm, unsigned sid);
    ~CStudent();
    unsigned getId() const;
    const string& getName() const;
    void takeCourse(CCourse* c);
    void quitCourse(CCourse* c);
    string printCourses() const;
    int getTotalCredits() const;
};
//课程类
class CCourse{
    string name;
    unsigned id;
    int credit;
    vector<CStudent*> stu;
public:
    CCourse(string nm, unsigned cid, int crdt);
    ~CCourse();
    int getCredit();
    unsigned getId();
    const string& getName();
    string printStudents() const;
    void take(CStudent* s);
    void quit(CStudent* s);
};
```

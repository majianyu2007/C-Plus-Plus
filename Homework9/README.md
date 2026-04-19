#### 第9次作业
1.  某书店销售各种期刊杂志、书籍、音乐CD 和VCD。设计描述各种商品信息的类层次结构，采用在线UML工具(https://app.diagrams.net/)绘制对应UML图并补全代码：
(1) 期刊杂志有期刊名、发行刊号、发行周期、期、价格等信息；
(2) 书籍有书名、作者、出版社、ISBN、价格等信息；
(3) 音乐CD 有CD 名、演唱（奏）者、风格、曲目时间、价格等信息；
(4) VCD 有片名、曲目时间、价格等信息。
书店需要一个书籍销售管理系统，假定每件商品的信息可以通过扫描条码输入系统，请绘制UML图、实现系统结账模块的商品价格计算和清单打印操作。
程序框架与测试代码如下：
```cpp
class Cart
{
public:
    Cart() {}
    ~Cart() {}
    void addItem(Goods* g);
    double totalPrice();
    string goodsList();
private:
    vector<Goods*> items;
};

class Goods
{
public:
    Goods(string t, double pr);
    virtual ~Goods() {}
    virtual double getPrice();
    virtual string getTitle();
    virtual string getDetails()=0;
private:
    string title;
    double price;
};

class Book : public Goods
{
public:
    Book(string t, double pr);
    ~Book() {}
    void setDetails(string au, string pr, string isbn);
    string getDetails();
private:
    string author;
    string press;
    string ISBN;
};

class Magazine : public Goods
{
public:
    Magazine(string t, double pr);
    ~Magazine() {}
    void setDetails(string isn, string p,string is);
    string getDetails();
private:
    string issue;
    string issNo;
    string period;
};

class MusicCD : public Goods
{
public:
    MusicCD(string t, double p);
    ~MusicCD() {}
    void setDetails(string p, string st,int tr, int t);
    string getDetails();
private:
    string player;
    string style;
    int tracks;
    int lasttime;
};

class VCD : public Goods
{
public:
    VCD(string t, double p);
    ~VCD() {}
    void setDetails(int t, string des);
    string getDetails();
private:
    string description;
    int lasttime;
};

int main()
{
    Cart ct;
    const int n = 4;
    Goods* gs[n] =
    {
        new MusicCD("Eagles", 12),
        new VCD("African Animals", 23),
        new Book("The DaVinci Code", 22),
        new Magazine("Reader", 5)
    };

    for(int i=0; i<n; i++) ct.addItem(gs[i]);
    cout<<ct.goodsList()<<endl;
    cout<<"Total Price: "<<ct.totalPrice()<<endl;
    for(int i=0; i<n; i++)
        delete gs[i];
}

```
